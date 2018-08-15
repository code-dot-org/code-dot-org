# Only apply recipe to EC2 instances.
if node[:ec2]
  # Upgrade to AWS-tuned kernel package on EC2 instances.
  apt_package 'linux-aws'
  include_recipe 'ixgbevf'
end
