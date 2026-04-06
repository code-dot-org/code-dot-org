#=============================================================================
# Create a new VPC and Internet Gateway when variable create_new_vpc = true
#=============================================================================

check "new_vpc_cidr_contains_subnets" {
  assert {
    condition = !var.create_new_vpc || alltrue([
      cidrcontains(var.create_new_vpc_cidr, var.public_subnet_1_cidr),
      cidrcontains(var.create_new_vpc_cidr, var.public_subnet_2_cidr),
      cidrcontains(var.create_new_vpc_cidr, var.private_subnet_1_cidr),
      cidrcontains(var.create_new_vpc_cidr, var.private_subnet_2_cidr),
    ])
    error_message = "When create_new_vpc is true, all subnet CIDRs must be contained within create_new_vpc_cidr."
  }
}

resource "aws_vpc" "this" {
  count = var.create_new_vpc ? 1 : 0

  cidr_block           = var.create_new_vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
}

resource "aws_internet_gateway" "this" {
  count = var.create_new_vpc ? 1 : 0

  vpc_id = aws_vpc.this[0].id
}
