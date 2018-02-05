namespace :adhoc do
  task :environment do
    require_relative '../../deployment'
    CDO.stack_name = nil
    CDO.chef_local_mode = !ENV['CHEF_SERVER']
    if CDO.chef_local_mode
      ENV['RAILS_ENV'] = ENV['RACK_ENV'] = 'adhoc'
      CDO.rack_env = :adhoc
    end
    require 'cdo/aws/cloud_formation'
  end

  desc 'Launch/update an adhoc server.
Note: Consumes AWS resources until `adhoc:stop` is called.'
  task start: :environment do
    raise "adhoc name must not include 'dashboard'" if AWS::CloudFormation.stack_name.include?('dashboard')
    AWS::CloudFormation.create_or_update
  end

  desc 'Start an inactive adhoc server'
  task start_inactive_instance: :environment do
    AWS::CloudFormation.start_inactive_instance
  end

  desc 'Stop an adhoc server. Clean up all consumed AWS resources'
  task stop: :environment do
    AWS::CloudFormation.delete
  end

  desc 'Validate adhoc CloudFormation template.'
  task validate: :environment do
    AWS::CloudFormation.validate
  end

  namespace :full_stack do
    task :environment do
      ENV['TEMPLATE'] = 'cloud_formation_stack.yml.erb'
      ENV['CDN_ENABLED'] = '1'
    end

    desc 'Launch a full-stack adhoc environment with auto-scaling frontends,
daemon CI server, cache clusters and CDN.
Note: Consumes AWS resources until `adhoc:stop` is called.'
    task start: :environment do
      Rake::Task['adhoc:start'].invoke
    end

    task validate: :environment do
      Rake::Task['adhoc:validate'].invoke
    end
  end

  namespace :cdn do
    task :environment do
      ENV['CDN_ENABLED'] = '1'
    end

    desc 'Launch an adhoc server, with CloudFront CDN enabled.
Note: Consumes AWS resources until `adhoc:stop` is called.'
    task start: :environment do
      Rake::Task['adhoc:start'].invoke
    end

    task validate: :environment do
      Rake::Task['adhoc:validate'].invoke
    end
  end
end
