# variables.tf
variable "region" {
  type    = string
  default = "us-east-1"
  # or no default if you want to require it be passed in
}

variable "cluster_name" {
  type    = string
  default = "my-eks-cluster"
}

variable "private_subnets" {
  type    = list(string)
  # default = ["subnet-abc123", "subnet-def456"]  # or empty list if not using it yet
}
