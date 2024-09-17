require lib_dir 'cdo/data/logging/rake_task_event_logger'
include TimedTaskWithLogging

namespace :adhoc do
  timed_task_with_logging :environment do
    require_relative '../../deployment'
    raise "RAILS_ENV=adhoc required to deploy adhoc instance." unless rack_env?(:adhoc)
    Dir.chdir aws_dir('cloudformation')
    require 'cdo/aws/cloud_formation'
    require 'cdo/cloud_formation/cdo_app'
    @cfn = AWS::CloudFormation.new(
      stack: (@template = Cdo::CloudFormation::CdoApp.new(
        filename: ENV.fetch('TEMPLATE', nil),
        stack_name: ENV['STACK_NAME'].dup,
        branch: ENV['BRANCH'] || ENV.fetch('branch', nil),
        database: ENV.fetch('DATABASE', nil),
        frontends: ENV.fetch('FRONTENDS', nil),
        cdn_enabled: ENV.fetch('CDN_ENABLED', nil),
        alarms: ENV.fetch('ALARMS', nil)
      )),
      log: CDO.log,
      verbose: ENV.fetch('VERBOSE', nil),
      quiet: ENV.fetch('QUIET', nil),
      import_resources: ENV.fetch('IMPORT_RESOURCES', nil),
    )
  end

  desc 'Launch/update an adhoc server.
Note: Consumes AWS resources until `adhoc:stop` is called.'
  timed_task_with_logging start: :environment do
    @cfn.create_or_update
  end

  desc 'Start an inactive adhoc server'
  timed_task_with_logging start_inactive_instance: :environment do
    @cfn.start_inactive_instance
  end

  desc 'Stop an adhoc environment\'s EC2 Instance '
  timed_task_with_logging stop: :environment do
    @cfn.stop
  end

  desc 'Delete an adhoc environment and all of its AWS Resources.  '
  timed_task_with_logging delete: :environment do
    @cfn.delete
  end

  desc 'Validate adhoc CloudFormation template.'
  timed_task_with_logging validate: :environment do
    @cfn.validate
  end

  namespace :full_stack do
    timed_task_with_logging :environment do
      ENV['FRONTENDS'] = '1'
      ENV['DATABASE'] = '1'
      ENV['CDN_ENABLED'] = '1'
    end

    desc 'Launch a full-stack adhoc environment with auto-scaling frontends,
daemon CI server, cache clusters and CDN.
Note: Consumes AWS resources until `adhoc:stop` is called.'
    timed_task_with_logging start: :environment do
      Rake::Task['adhoc:start'].invoke
    end

    timed_task_with_logging validate: :environment do
      Rake::Task['adhoc:validate'].invoke
    end
  end

  namespace :cdn do
    timed_task_with_logging environment: 'adhoc:environment' do
      @template.options[:cdn_enabled] = true
    end

    desc 'Launch an adhoc server, with CloudFront CDN enabled.
Note: Consumes AWS resources until `adhoc:stop` is called.'
    timed_task_with_logging start: :environment do
      Rake::Task['adhoc:start'].invoke
    end

    timed_task_with_logging validate: :environment do
      Rake::Task['adhoc:validate'].invoke
    end
  end
end
