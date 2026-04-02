# This will be the name you see in EKS and kubectl:
cluster_name = "codeai-k8s"

# AWS region
region = "us-east-1"

# Cluster will use ExternalDNS to automatically map external services
# as https://${service_name}/${cluster_subdomain}.${parent_domain}
# e.g. https://argocd.k8s.code.org
parent_domain     = "code.org"
cluster_subdomain = "k8s"

##### NETWORKING #####

# OPTION 1: use our existing VPC + Internet Gateway
create_new_vpc               = false
existing_vpc_id              = "vpc-6e98810a" # code.org default in mar 2026
existing_internet_gateway_id = "igw-04a32960" # code.org default in mar 2026

# OPTION 2: to create a new VPC + Internet Gateway:
# create_new_vpc = true
# create_new_vpc_cidr = "10.0.0.0/16"

# If OPTION 1: better check these IP blocks are available! these work in mar 2026
# If OPTION 2: maybe you prefer a fresh layout? recommend at least a /20 for each
public_subnet_1_cidr  = "10.0.64.0/20"
public_subnet_2_cidr  = "10.0.80.0/20"
private_subnet_1_cidr = "10.0.192.0/20"
private_subnet_2_cidr = "10.0.208.0/20"

