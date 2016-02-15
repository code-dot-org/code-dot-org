# cdo-deploy

Uses [chef-provisioning-aws](https://github.com/chef/chef-provisioning-aws) driver to set up a cdo-apps infrastructure on AWS.

- [VPC](http://docs.aws.amazon.com/AmazonVPC/latest/UserGuide)
  - Subnet
  - [Security Group](http://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/VPC_SecurityGroups.html)
- [Load Balancer](http://docs.aws.amazon.com/ElasticLoadBalancing/latest/DeveloperGuide)
- [Auto-Scaling Group](http://docs.aws.amazon.com/AutoScaling/latest/DeveloperGuide)
  - [Launch Configuration](http://docs.aws.amazon.com/AutoScaling/latest/DeveloperGuide/LaunchConfiguration.html)
    - User-data to bootstrap the instance
- [DNS Entries](http://docs.aws.amazon.com/Route53/latest/DeveloperGuide)
