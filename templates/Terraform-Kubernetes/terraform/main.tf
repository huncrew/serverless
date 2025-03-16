###################################
# Provider + Variables
###################################
provider "aws" {
  region = var.region
}

variable "region" {
  type    = string
  default = "us-east-1"
}

# Name for your ECS cluster
variable "cluster_name" {
  type    = string
  default = "my-ecs-cluster"
}

###################################
# VPC (same as before)
###################################
resource "aws_vpc" "this" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.this.id
  cidr_block             = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "private_1" {
  vpc_id                  = aws_vpc.this.id
  cidr_block             = "10.0.2.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = false
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }
}

resource "aws_route_table_association" "public_rt_assoc_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_eip" "nat_eip" {
  vpc = true
}

resource "aws_nat_gateway" "this" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_1.id
}

resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.this.id
  }
}

resource "aws_route_table_association" "private_rt_assoc_1" {
  subnet_id      = aws_subnet.private_1.id
  route_table_id = aws_route_table.private_rt.id
}

###################################
# ECS Cluster
###################################
resource "aws_ecs_cluster" "this" {
  name = var.cluster_name
}

###################################
# IAM Role for Fargate Tasks
###################################
data "aws_iam_policy_document" "ecs_task_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "ecsTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

###################################
# Security Group for Fargate Service
###################################
resource "aws_security_group" "fargate_sg" {
  name   = "fargate-service-sg"
  vpc_id = aws_vpc.this.id

  # Example: allow inbound on port 3000 from anywhere
  # Adjust or remove if you want different rules
  ingress {
    description = "Allow inbound on 3000"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

###################################
# ECS Task Definition (Fargate)
###################################
resource "aws_ecs_task_definition" "this" {
  family                   = "my-fargate-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = <<EOF
[
  {
    "name": "my-products",
    "image": "YOUR_ECR_REPO_URI:latest", 
    "essential": true,
    "portMappings": [
      {
        "containerPort": 3000,
        "hostPort": 3000
      }
    ]
  }
]
EOF
}

###################################
# ECS Service (Fargate)
###################################
resource "aws_ecs_service" "this" {
  name            = "my-fargate-service"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.this.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.private_1.id, aws_subnet.public_1.id]
    security_groups  = [aws_security_group.fargate_sg.id]
    assign_public_ip = true  # Set to false if you want only private
  }

  # If you want to attach an ALB for HTTP traffic, you'd define a load_balancer block here.
  # For example:
  # load_balancer {
  #   target_group_arn = aws_lb_target_group.this.arn
  #   container_name   = "my-products"
  #   container_port   = 3000
  # }
  #
  # depends_on = [aws_lb_listener.http]

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
}

###################################
# Outputs
###################################
output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.this.id
}

output "ecs_cluster_name" {
  description = "The name of the ECS cluster"
  value       = aws_ecs_cluster.this.name
}

output "fargate_service_name" {
  description = "The name of the Fargate service"
  value       = aws_ecs_service.this.name
}