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
# Terraform Backend
###################################

terraform {
  backend "s3" {
    bucket         = "my-terraform-state-bucket-dalegrant"
    key            = "myproject/prod/terraform.tfstate"
    region         = "us-east-1"
  }
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
# ECR Repositories
###################################
resource "aws_ecr_repository" "products" {
  name                 = "products"
  image_tag_mutability = "MUTABLE"   # or IMMUTABLE
  image_scanning_configuration {
    scan_on_push = true
  }
}

###################################
# ALB (ECS/Fargate containers)
###################################
resource "aws_lb" "this" {
    name = "my-app-alb"
    load_balancer_type = "application"
    subnets = [
        aws_subnet.public_1.id,
        aws_subnet.public_2.id
    ]
    security_groups = [aws_security_group.alb_sg.id]
}

###################################
# ALB Target Groups / Listeners (ECS/Fargate containers)
###################################
resource "aws_lb_target_group" "this" {
  name        = "my-app-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.this.id
  target_type = "ip"  # for Fargate
  health_check {
    path = "/health"  # or wherever your app responds
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this.arn
  }
}



###################################
# Security Group for ALB (ECS/Fargate containers)
###################################
resource "aws_security_group" "alb_sg" {
    name = "alb-sg"
    vpc_id = aws_vpc.this.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # If HTTPS:
  # ingress {
  #   from_port = 443
  #   to_port   = 443
  #   protocol  = "tcp"
  #   cidr_blocks = ["0.0.0.0/0"]
  # }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
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
    assign_public_ip = false
  }


  load_balancer {
    target_group_arn = aws_lb_target_group.this.arn
    container_name   = "my-products" # must match your container definition name
    container_port   = 3000          # must match your container's port
  }

  depends_on = [
    aws_lb_listener.http
  ]

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