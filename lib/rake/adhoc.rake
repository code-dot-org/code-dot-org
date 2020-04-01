namespace :adhoc do
  task :environment do
    require_relative '../../deployment'
    raise "RAILS_ENV=adhoc required to deploy adhoc instance." unless rack_env?(:adhoc)
    Dir.chdir aws_dir('cloudformation')
    require 'cdo/aws/cloud_formation'
    require 'cdo/cloud_formation/cdo_app'
    @cfn = AWS::CloudFormation.new(
      stack_name: ENV['STACK_NAME'],
      template: ENV['TEMPLATE'] || 'cloud_formation_stack.yml.erb',
      stack: (@template = Cdo::CloudFormation::CdoApp.new(
        frontends: ENV['FRONTENDS']
      )),
      log: CDO.log,
      verbose: ENV['VERBOSE'],
      quiet: ENV['QUIET'],
    )
  end

  desc 'Launch/update an adhoc server.
Note: Consumes AWS resources until `adhoc:stop` is called.'
  task start: :environment do
    @cfn.create_or_update
  end

  desc 'Start an inactive adhoc server'
  task start_inactive_instance: :environment do
    @cfn.start_inactive_instance
  end

  desc 'Stop an adhoc environment\'s EC2 Instance '
  task stop: :environment do
    @cfn.stop
  end

  desc 'Delete an adhoc environment and all of its AWS Resources.  '
  task delete: :environment do
    @cfn.delete
  end

  desc 'Validate adhoc CloudFormation template.'
  task validate: :environment do
    @cfn.validate
  end

  namespace :full_stack do
    task :environment do
      ENV['FRONTENDS'] = '1'
      ENV['DATABASE'] = '1'
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
