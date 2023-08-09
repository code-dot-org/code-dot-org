require 'cdo/chat_client'
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

  desc 'Stop an adhoc environment\'s EC2 Instance.'
  timed_task_with_logging stop: :environment do
    @cfn.stop
  end

  desc 'Delete an adhoc environment and all of its AWS Resources.'
  timed_task_with_logging delete: :environment do
    @cfn.delete
  end

  desc 'Validate adhoc CloudFormation template.'
  timed_task_with_logging validate: :environment do
    @cfn.validate
  end

  desc 'Cleans up adhoc resources no longer in use, stopping instances or deleting the stack.'
  timed_task_with_logging cleanup: :environment do
    # What do?
    # - stop_running_adhoc_instances
    # - delete_stale_adhoc_stacks
    # - log_error_stacks

    if @cfn.stack_has_running_instance?
      log.info "Instance #{@cfn.instance.id} is running."
    else
      log.info "Instance is not running."
    end
    # Can we simply call @cfn.delete here?
  end

  desc 'Cleans up all adhoc environments, stopping instances or deleting the stacks.'
  timed_task_with_logging cleanup_all: :environment do
    # Note that while @cfn relates to a single adhoc environment, we'll be operating on all of them.
    # TODO: some for of iteration on cleanup:

    # What do?
    # - tag_previously_stopped_adhocs
    #   - foreach adhoc stack
    #     - foreach ec2 instance within
    #     - if stopped and untagged
    #       - tag with a Stopped_At timestamp

    ChatClient.log "Fetching adhoc stacks..."
    adhoc_stacks = @cfn.describe_adhoc_stacks

    ChatClient.log "Checking instance status for each stack..."
    adhoc_stacks.each do |stack|
      begin
        # TODO: extend to support multiple instances per stack
        cfn_stack = Aws::CloudFormation::Stack.new(stack.stack_name)

        instance = Aws::EC2::Instance.new(id: cfn_stack.resource('WebServer').physical_resource_id)
        ChatClient.log "Instance: #{instance.id} - #{instance.state.name}"
      rescue Aws::EC2::Errors::InvalidInstanceIDNotFound
        ChatClient.log "Oh snatp caught that error"
      end
    end

    # - stop_running_adhoc_instances
    # - delete_stale_adhoc_stacks
    # - log_error_stacks
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
