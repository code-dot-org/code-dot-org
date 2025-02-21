#!/bin/bash

# List available AWS profiles
profiles=($(aws configure list-profiles))
echo "Available AWS profiles:"
for i in "${!profiles[@]}"; do
    echo "$i) ${profiles[$i]}"
done

# Prompt user to select a profile
read -p "Select an AWS profile by number: " profile_index
export AWS_PROFILE="${profiles[$profile_index]}"
echo "Selected profile: $AWS_PROFILE"
echo

# Suggest a default region based on the selected profile
if [[ "$AWS_PROFILE" == "codeorg-dev" ]]; then
    default_region="us-west-2"
else
    default_region="us-east-1"
fi
echo "Suggested region: $default_region"

# Prompt user to select a region
read -p "Enter AWS region (press Enter to use $default_region): " region
export AWS_REGION="${region:-$default_region}"
echo "Selected region: $AWS_REGION"
echo

# FIXME: We are only doing this because old aws-google is crashing trying to run aws commands
BUNDLE_EXEC='bundle exec'

# List available EKS clusters for the selected profile and region
clusters=($($BUNDLE_EXEC aws eks list-clusters --query "clusters" --output text))
if [ -z "$clusters" ]; then
    echo "No EKS clusters found for profile $AWS_PROFILE in region $AWS_REGION"
    exit 1
fi

echo "Available EKS clusters:"
for i in "${!clusters[@]}"; do
    echo "$i) ${clusters[$i]}"
done

# Prompt user to select a cluster
read -p "Select an EKS cluster by number: " cluster_index
cluster="${clusters[$cluster_index]}"
echo "Selected cluster: $cluster"
echo

# Update kubeconfig for the selected cluster
aws eks update-kubeconfig --name "$cluster"

# Verify that we can reach the cluster
kubectl cluster-info

echo
echo "kubectl has been configured for the EKS cluster: $cluster in region: $AWS_REGION"