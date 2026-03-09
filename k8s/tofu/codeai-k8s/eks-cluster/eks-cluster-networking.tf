#============================================================
# Networking for our EKS cluster
#============================================================

# We have public and private subnets for the cluster, each in two AZs for
# high availability. If and when we want a real production namespace, it should
# be segmented into its own private subnets.

# This file creates the cluster networking inside an existing VPC. We re-use the
# VPC and Internet Gateway, but create cluster-specific public/private subnets,
# routing tables, and NAT gateways.

data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  azs = slice(data.aws_availability_zones.available.names, 0, 2)

  public_subnet_tags = {
    "kubernetes.io/role/elb"                    = "1"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb"           = "1"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }
}


#============================================================
# Public Networking
#============================================================

# === Public Routing ===
# Public route table and route to the Internet

resource "aws_route_table" "public" {
  vpc_id = var.vpc_id
}

resource "aws_route" "public_internet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = var.internet_gateway_id
}

# === Public Subnets ===
# Public subnets with ELB role for external access

resource "aws_subnet" "public_1" {
  vpc_id                  = var.vpc_id
  cidr_block              = var.public_subnet_1_cidr
  availability_zone       = local.azs[0]
  map_public_ip_on_launch = true
  tags                    = local.public_subnet_tags
}

resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_subnet" "public_2" {
  vpc_id                  = var.vpc_id
  cidr_block              = var.public_subnet_2_cidr
  availability_zone       = local.azs[1]
  map_public_ip_on_launch = true
  tags                    = local.public_subnet_tags
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

resource "aws_eip" "nat_1" {
  domain = "vpc"
}

resource "aws_nat_gateway" "nat_1" {
  allocation_id = aws_eip.nat_1.id
  subnet_id     = aws_subnet.public_1.id
}

resource "aws_eip" "nat_2" {
  domain = "vpc"
}

#============================================================
# Private Networking
#============================================================

# === NAT Gateway for Private Subnets ===
# Provides private subnets outbound-only internet access.

resource "aws_nat_gateway" "nat_2" {
  allocation_id = aws_eip.nat_2.id
  subnet_id     = aws_subnet.public_2.id
}

# === Private Routing ===
# Private route tables for each private subnet

resource "aws_route_table" "private_1" {
  vpc_id = var.vpc_id
}

resource "aws_route" "private_1_nat" {
  route_table_id         = aws_route_table.private_1.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.nat_1.id
}

resource "aws_route_table" "private_2" {
  vpc_id = var.vpc_id
}

resource "aws_route" "private_2_nat" {
  route_table_id         = aws_route_table.private_2.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.nat_2.id
}

# === Private Subnets ===
# Private subnets for internal services

resource "aws_subnet" "private_1" {
  vpc_id                  = var.vpc_id
  cidr_block              = var.private_subnet_1_cidr
  availability_zone       = local.azs[0]
  map_public_ip_on_launch = false
  tags                    = local.private_subnet_tags
}

resource "aws_route_table_association" "private_1" {
  subnet_id      = aws_subnet.private_1.id
  route_table_id = aws_route_table.private_1.id
}

resource "aws_subnet" "private_2" {
  vpc_id                  = var.vpc_id
  cidr_block              = var.private_subnet_2_cidr
  availability_zone       = local.azs[1]
  map_public_ip_on_launch = false
  tags                    = local.private_subnet_tags
}

resource "aws_route_table_association" "private_2" {
  subnet_id      = aws_subnet.private_2.id
  route_table_id = aws_route_table.private_2.id
}
