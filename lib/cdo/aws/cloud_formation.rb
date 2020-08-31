require 'active_support/core_ext/string/inflections'
require 'active_support/core_ext/numeric/time'
require 'aws-sdk-cloudformation'
require 'aws-sdk-s3'
require 'json'
require 'yaml'
require 'erb'
require 'digest'
require 'highline'

module AWS
  # Manages configuration and deployment of AWS CloudFormation stacks.
  class CloudFormation
    # @return [Logger]
    attr_accessor :log

    # @return [Cdo::CloudFormation::StackTemplate]
    attr_reader :stack
    delegate :stack_name, to: :stack

    # @return [Hash]
    attr_reader :options

    # Default S3 bucket for uploading temporary template files.
    TEMP_S3_BUCKET = 'cf-templates-p9nfb0gyyrpf-us-east-1'

    # A stack name can contain only alphanumeric characters (case sensitive) and hyphens.
    # Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-using-console-create-stack-parameters.html
    STACK_NAME_INVALID_REGEX = /[^[[:alnum:]-]]/

    # https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cloudformation-limits.html
    # Max size of template body you can pass directly to the CloudFormation API.
    TEMPLATE_MAX = 51_200
    # Max size of template body you can pass in an S3 object with a template URL.
    TEMPLATE_S3_MAX = 460_800

    # @param [Cdo::CloudFormation::StackTemplate] stack
    # @param [Logger] log
    def initialize(stack:, log: Logger.new(STDOUT), **options)
      @stack = stack
      @log = log
      @options = options
      @stack_resource = nil

      options[:policy] ||= stack.filename.split('.').tap {|s| s.first << '-policy'}.join('.')
      options[:temp_bucket] ||= TEMP_S3_BUCKET
      stack_name.gsub!(STACK_NAME_INVALID_REGEX, '-')
    end

    # Validates that the template is valid CloudFormation syntax.
    # First prints the rendered template (if `verbose`), then either raises an error (if invalid)
    # or prints the pending stack-resource changes.
    def validate
      stack.dry_run = true
      change_stack
    end

    # Creates a new stack or updates an existing stack if it already exists.
    # Pending stack-resource changes will be displayed pending confirmation before proceeding.
    # If `quiet` is set create/update will proceed without input.
    def create_or_update
      change_stack
    end

    # Deletes a stack if it already exists.
    def delete
      if stack_exists?
        log.info "Shutting down #{stack_name}..."
        stack_action(:delete, base_options)
      else
        warn "Stack #{stack_name} does not exist."
      end
    end

    private

    # @return [Aws::CloudFormation::Client]
    def cfn
      @cfn ||= Aws::CloudFormation::Client.new
    end

    def change_stack
      template = stack.render
      if options[:verbose]
        log.info template.lines.map.with_index(1) {|line, i| format("[%3d] %s", i, line)}.join
      end
      stack_options = change_set_options(template)
      params = stack_options[:parameters].reject {|x| x[:parameter_value].nil?}
      unless options[:quiet] || params.empty?
        log.info "Parameters:\n#{params.map {|p| "#{p[:parameter_key]}: #{p[:parameter_value]}"}.join("\n")}"
      end

      prepare_changes(stack_options, "#{stack_name}-#{Digest::MD5.hexdigest(template)}")
    end

    # Prepare changes to a stack using a Change Set.
    def prepare_changes(stack_options, name)
      action = stack_options[:change_set_type].downcase.to_sym
      log.info "Pending #{action} for stack `#{stack_name}`:" unless options[:quiet]
      change_set_id = cfn.create_change_set(
        stack_options.merge(change_set_name: name)
      ).id

      begin
        change_set = {changes: []}
        loop do
          sleep 1
          change_set = cfn.describe_change_set(change_set_name: change_set_id)
          break unless %w(CREATE_PENDING CREATE_IN_PROGRESS).include?(change_set.status)
        end
        change_set.changes.each do |change|
          c = change.resource_change
          str = "#{c.action} #{c.logical_resource_id} [#{c.resource_type}] #{c.scope.join(', ')}"
          str += " Replacement: #{c.replacement}" if %w(True Conditional).include?(c.replacement)
          str += " (#{c.details.map {|d| d.target.name}.join(', ')})" if c.details.any?
          log.info str unless options[:quiet]
        end
        if change_set.changes.empty?
          log.info 'No changes'
        elsif !stack.dry_run
          if options[:quiet] || HighLine.new.agree("Proceed? [y/n]", true)
            apply_changes(stack_options, change_set_id, action)
          end
        end
      ensure
        begin
          cfn.delete_change_set(change_set_name: change_set_id)
        rescue Aws::CloudFormation::Errors::InvalidChangeSetStatus
          # Change set can't be deleted if it's already been executed.
        end
      end
    end

    def apply_changes(stack_options, change_set_id, action)
      # Change Set does not support `on_failure` or `stack_policy` options
      # which are useful for stack creation, so apply create action directly.
      if action == :create
        log.info "#{action} stack: #{stack_name}..."
        stack_options.delete(:change_set_type)
        if File.file?(options[:policy])
          stack_policy = JSON.pretty_generate(YAML.load(stack.render(filename: options[:policy])))
          stack_options[:stack_policy_body] = stack_policy
          stack_options[:stack_policy_during_update_body] = stack_policy if action == :update
        end
        stack_options[:on_failure] = 'DO_NOTHING' if action == :create

        stack_action(action, stack_options)
      else
        cfn.execute_change_set(change_set_name: change_set_id)
        start = Time.now
        wait_for_stack(action) {tail_events(start)}
      end
    end

    # Returns an inline string or S3 URL depending on the size of the template.
    def string_or_url(template)
      # Upload the template to S3 if it's too large to be passed directly.
      if template.length < TEMPLATE_MAX
        {template_body: template}
      elsif template.length < TEMPLATE_S3_MAX
        log.debug 'Uploading template to S3...'
        bucket = options[:temp_bucket]
        key = "#{stack_name}-#{Digest::MD5.hexdigest(template)}-cfn.json"
        Aws::S3::Client.new.put_object(
          bucket: bucket,
          key: key,
          body: template
        )
        {template_url: "https://s3.amazonaws.com/#{bucket}/#{key}"}
      else
        raise 'Template is too large'
      end
    end

    def parameters(template)
      params = YAML.load(template)['Parameters']
      return [] unless params
      params.map do |key, properties|
        value = CDO[key.underscore] || ENV[key.underscore.upcase]
        param = {parameter_key: key}
        if value
          param[:parameter_value] = value
        elsif stack_exists? && @stack_resource&.parameters&.any? {|p| p.parameter_key == key}
          param[:use_previous_value] = true
        elsif properties['Default']
          next # use default param
        else
          # Required parameter value not found in environment, existing stack or default.
          # Ask for input directly.
          param[:parameter_value] = stack.dry_run ?
            '!Required' :
            HighLine.new.ask("Enter value for Parameter #{key}:", String)
        end
        param
      end.compact
    end

    def base_options
      # All stacks use the same shared Service Role for CloudFormation resource-management permissions.
      # Pass `ADMIN=1` to update admin resources with a privileged Service Role.
      role_name = "CloudFormation#{ENV['ADMIN'] ? 'Admin' : 'Service'}"
      account = Aws::STS::Client.new.get_caller_identity.account
      {
        stack_name: stack_name,
        role_arn: "arn:aws:iam::#{account}:role/admin/#{role_name}"
      }
    end

    def stack_options(template)
      @stack_options ||= base_options.merge(string_or_url(template)).merge(
        parameters: parameters(template),
        tags: stack.tags,
        capabilities: %w[
          CAPABILITY_IAM
          CAPABILITY_NAMED_IAM
        ]
      )
    end

    # Sets options specific to the CreateChangeSet operation.
    def change_set_options(template)
      opts = stack_options(template)
      if (imports = options[:import_resources]&.split(','))
        opts[:change_set_type] = 'IMPORT'
        summaries = cfn.get_template_summary(string_or_url(template)).resource_identifier_summaries
        opts[:resources_to_import] = imports.map do |import|
          logical_id, resource_id = import.split(':')
          summary = summaries.find {|r| r.logical_resource_ids.include?(logical_id)}
          {
            resource_type: summary.resource_type,
            logical_resource_id: logical_id,
            resource_identifier: {summary.resource_identifiers.first => resource_id}
          }
        end
        log.info "Resources to import:\n#{opts[:resources_to_import].join("\n")}"
      else
        opts[:change_set_type] = stack_exists? ? 'UPDATE' : 'CREATE'
      end
      opts
    end

    def stack_action(method, stack_options)
      start = Time.now
      begin
        result = cfn.method("#{method}_stack").call(stack_options)
        @stack_id ||= result.stack_id if result.respond_to?(:stack_id)
      rescue Aws::CloudFormation::Errors::ValidationError => e
        if e.message == 'No updates are to be performed.'
          log.info e.message
          return
        else
          raise
        end
      end
      wait_for_stack(method) do
        tail_events(start)
      end
    end

    # Only way to determine whether a given stack exists using the Ruby API.
    def stack_exists?
      @stack_resource ||=
        begin
          cfn.describe_stacks(stack_name: stack_name).stacks.first.tap do |stack|
            @stack_id = stack.stack_id
          end
        rescue Aws::CloudFormation::Errors::ValidationError => e
          raise e unless e.message == "Stack with id #{stack_name} does not exist"
          false
        end
      @stack_resource && !%w(REVIEW_IN_PROGRESS DELETE_COMPLETE).include?(@stack_resource.stack_status)
    end

    # Prints the latest CloudFormation stack events.
    def tail_events(start)
      @last_event ||= start
      stack_events = cfn.describe_stack_events(stack_name: @stack_id).stack_events
      stack_events.reject! do |event|
        event.timestamp <= @last_event ||
          stack.log_resource_filter.include?(event.logical_resource_id)
      end
      stack_events.sort_by(&:timestamp).each do |event|
        str = "#{event.logical_resource_id} [#{event.resource_status}]"
        str = "#{str}: #{event.resource_status_reason}" if event.resource_status_reason
        str = "#{event.timestamp}- #{str}" unless options[:quiet]
        log.info str
        if event.resource_status == 'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS'
          throw :success
        end
      end
      @last_event = ([@last_event] + stack_events.map(&:timestamp)).max
    end

    def wait_for_stack(action)
      log.info "Stack #{action} requested, waiting for provisioning to complete..."
      yield rescue nil
      begin
        cfn.wait_until("stack_#{action}_complete".to_sym, stack_name: @stack_id) do |w|
          w.delay = 5 # seconds
          w.max_attempts = 1.5.hours / w.delay
          w.before_wait do
            yield
            print '.' unless options[:quiet]
          end
        end
      rescue Aws::Waiters::Errors::FailureStateError
        yield rescue nil
        if action == :create
          log.info 'Stack will remain in its half-created state for debugging. To delete, run `rake adhoc:stop`.'
        end
        raise "\nError on #{action}."
      end
      yield rescue nil
      unless options[:quiet]
        log.info "\nStack #{action} complete."
        unless action == 'delete'
          log.info 'Outputs:'
          cfn.describe_stacks(stack_name: @stack_id).stacks.first.outputs.each do |output|
            log.info "#{output.output_key}: #{output.output_value}"
          end
        end

      end

      log.info "Don't forget to remove AWS resources by running `rake adhoc:delete` after you're done testing your instance!" if action == :create
    end
  end
end
