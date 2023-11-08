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
        filename: ENV['TEMPLATE'],
        stack_name: ENV['STACK_NAME'].dup,
        branch: ENV['BRANCH'] || ENV['branch'],
        database: ENV['DATABASE'],
        frontends: ENV['FRONTENDS'],
        cdn_enabled: ENV['CDN_ENABLED'],
        alarms: ENV['ALARMS']
      )),
      log: CDO.log,
      verbose: ENV['VERBOSE'],
      quiet: ENV['QUIET'],
      import_resources: ENV['IMPORT_RESOURCES'],
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

  desc 'Cleanup stopped adhoc environment instances and all of its AWS resources'
  timed_task_with_logging cleanup_stale_instances: :environment do
    STOPPED_AT_TAG = 'STOPPED AT'.freeze
    filters = {
      'instance-state-name' => 'stopped',
      'tag:environment' => 'adhoc',
      'tag:aws:cloudformation:logical-id' => 'WebServer',
    }.map {|k, v| {name: k, values: [v]}}

    MINIMUM_STOPPED_TIME_IN_SECS = 6 * 86400
    opts = {aws_filters: filters, deletion_tag: STOPPED_AT_TAG, minimum_time_stopped_in_seconds: MINIMUM_STOPPED_TIME_IN_SECS}
    ec2_instance_killer = EC2InstanceKiller(opts)
    ec2_instance_killer.delete
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
