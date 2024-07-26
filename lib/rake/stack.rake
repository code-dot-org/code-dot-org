require lib_dir 'cdo/data/logging/rake_task_event_logger'
include TimedTaskWithLogging

namespace :stack do
  timed_task_with_logging :environment do
    ENV['CDN_ENABLED'] ||= '1' unless rack_env?(:adhoc)
    ENV['DOMAIN'] ||= rack_env?(:adhoc) ? 'cdn-code.org' : 'code.org'
    Dir.chdir aws_dir('cloudformation')
    require 'cdo/aws/cloud_formation'
    require 'cdo/cloud_formation/cdo_app'
    @cfn = AWS::CloudFormation.new(
      stack: (@stack = Cdo::CloudFormation::CdoApp.new(
        filename: ENV.fetch('TEMPLATE', nil),
        stack_name: ENV['STACK_NAME'].dup,
        frontends: ENV.fetch('FRONTENDS', nil),
        domain: ENV.fetch('DOMAIN', nil),
        cdn_enabled: ENV.fetch('CDN_ENABLED', nil),
        commit: ENV.fetch('COMMIT', nil)
      )),
      log: CDO.log,
      verbose: ENV.fetch('VERBOSE', nil),
      quiet: ENV.fetch('QUIET', nil),
      import_resources: ENV.fetch('IMPORT_RESOURCES', nil),
    )
  end

  namespace :start do
    timed_task_with_logging default: :environment do
      @cfn.create_or_update
    end

    desc 'Launch/update a full-stack deployment with CloudFront CDN disabled.
Note: Consumes AWS resources until `stack:stop` is called.'
    timed_task_with_logging no_cdn: :environment do
      @stack.options[:cdn_enabled] = false
      @cfn.create_or_update
    end
  end

  desc 'Launch/update a full-stack deployment.
Note: Consumes AWS resources until `adhoc:stop` is called.'
  timed_task_with_logging start: ['start:default']

  # `stop` command intentionally removed. Use AWS console to manually delete stacks.

  desc 'Validate CloudFormation template.'
  timed_task_with_logging validate: :environment do
    @cfn.validate
  end

  desc 'Lint Cloudformation template.'
  timed_task_with_logging lint: :environment do
    @cfn.lint
  end

  # Managed resource stacks other than the Code.org application.
  simple_stacks = %I(lambda alerting)
  rack_stacks = %I(ami data)
  other_stacks = %I(vpc iam)
  (other_stacks + rack_stacks + simple_stacks).each do |stack|
    namespace stack do
      timed_task_with_logging :environment do
        stack_name = ENV.fetch('STACK_NAME', nil)
        stack_name ||= stack.to_s if simple_stacks.include?(stack)
        stack_name ||= "#{stack.upcase}#{"-#{rack_env}" if rack_stacks.include?(stack)}"

        Dir.chdir aws_dir('cloudformation')
        require 'cdo/aws/cloud_formation'
        require 'cdo/cloud_formation/stack_template'
        @cfn = AWS::CloudFormation.new(
          stack: Cdo::CloudFormation::StackTemplate.new(
            filename: ENV['TEMPLATE'] || "#{stack}.yml.erb",
            stack_name: stack_name
          ),
          log: CDO.log,
          verbose: ENV.fetch('VERBOSE', nil),
          quiet: ENV.fetch('QUIET', nil),
          import_resources: ENV.fetch('IMPORT_RESOURCES', nil),
        )
      end

      desc "Launch/update #{stack} stack component."
      timed_task_with_logging start: :environment do
        @cfn.create_or_update
      end

      desc "Validate #{stack} stack template."
      timed_task_with_logging validate: :environment do
        @cfn.validate
      end

      desc "Lint #{stack} stack template."
      timed_task_with_logging lint: :environment do
        @cfn.lint
      end

      # `stop` command intentionally removed. Use AWS console to manually delete stacks.
    end
  end
end
