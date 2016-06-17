namespace :stack do
  task :environment do
    require_relative '../../deployment'
    CDO.chef_local_mode = false
    ENV['INSTANCE_TYPE'] ||= 'c4.8xlarge'
    ENV['TEMPLATE'] ||= 'cloud_formation_stack.yml.erb'
    ENV['CDN_ENABLED'] ||= '1'
    ENV['DOMAIN'] ||= 'code.org'
    ENV['STACK_NAME'] ||= rack_env.to_s
    require 'cdo/aws/cloud_formation'
  end

  namespace :start do

    task default: :environment do
      AWS::CloudFormation.create_or_update
    end

    desc 'Launch/update a full-stack deployment with CloudFront CDN disabled.
Note: Consumes AWS resources until `stack:stop` is called.'
    task no_cdn: :environment do
      ENV['CDN_ENABLED'] = nil
      AWS::CloudFormation.create_or_update
    end

  end

  desc 'Launch/update a full-stack deployment.
Note: Consumes AWS resources until `adhoc:stop` is called.'
  task start: ['start:default']

  # `stop` command intentionally removed. Use AWS console to manually delete stacks.

  desc 'Validate CloudFormation template.'
  task validate: :environment do
    AWS::CloudFormation.validate
  end

  %I(vpc iam ami).each do |stack|
    namespace stack do
      task :environment do
        require_relative '../../deployment'
        ENV['TEMPLATE'] ||= "#{stack}.yml.erb"
        ENV['STACK_NAME'] ||= stack == :ami ? "AMI-#{rack_env}" : stack.upcase.to_s
        CDO.chef_local_mode = true if rack_env? :adhoc
        require 'cdo/aws/cloud_formation'
      end

      desc "Launch/update #{stack} stack component."
      task start: :environment do
        AWS::CloudFormation.create_or_update
      end

      desc "Validate #{stack} stack template."
      task validate: :environment do
        AWS::CloudFormation.validate
      end

      # `stop` command intentionally removed. Use AWS console to manually delete stacks.

    end
  end
end
