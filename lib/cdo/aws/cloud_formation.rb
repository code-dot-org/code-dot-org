require_relative '../../../deployment'
require 'active_support/core_ext/string/inflections'
require 'active_support/core_ext/object/blank'
require 'cdo/rake_utils'
require 'aws-sdk'
require 'json'
require 'yaml'
require 'erb'
require 'tempfile'
require 'base64'
require 'uglifier'
require 'digest'

# Manages application-specific configuration and deployment of AWS CloudFront distributions.
module AWS
  class CloudFormation
    # Hard-coded values for our CloudFormation template.
    TEMPLATE = ENV['TEMPLATE'] || 'cloud_formation_adhoc_standalone.yml.erb'
    TEMP_BUCKET = ENV['TEMP_S3_BUCKET'] || 'cf-templates-p9nfb0gyyrpf-us-east-1'

    DOMAIN = ENV['DOMAIN'] || 'cdn-code.org'

    # Lookup ACM certificate for ELB and CloudFront SSL.
    ACM_REGION = 'us-east-1'.freeze
    CERTIFICATE_ARN = Aws::ACM::Client.new(region: ACM_REGION).
      list_certificates(certificate_statuses: ['ISSUED']).
      certificate_summary_list.
      find {|cert| cert.domain_name == "*.#{DOMAIN}" || cert.domain_name == DOMAIN}.
      certificate_arn

    # A stack name can contain only alphanumeric characters (case sensitive) and hyphens.
    # Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-using-console-create-stack-parameters.html
    STACK_NAME_INVALID_REGEX = /[^[:alnum:]-]/

    SSH_KEY_NAME = 'server_access_key'.freeze
    IMAGE_ID = ENV['IMAGE_ID'] || 'ami-c8580bdf' # ubuntu/images/hvm-ssd/ubuntu-trusty-14.04-amd64-server-*
    INSTANCE_TYPE = rack_env?(:production) ? 'm4.10xlarge' : 't2.large'
    SSH_IP = '0.0.0.0/0'.freeze
    S3_BUCKET = 'cdo-dist'.freeze
    CHEF_KEY = rack_env?(:adhoc) ? 'adhoc/chef' : 'chef'

    AVAILABILITY_ZONES = ('b'..'e').map {|i| "us-east-1#{i}"}

    STACK_ERROR_LINES = 250
    LOG_NAME = '/var/log/bootstrap.log'.freeze

    class << self
      attr_accessor :daemon
      attr_accessor :log_resource_filter
      CloudFormation.log_resource_filter = []

      def branch
        ENV['branch'] || (rack_env?(:adhoc) ? RakeUtils.git_branch : rack_env)
      end

      def stack_name
        (ENV['STACK_NAME'] || CDO.stack_name || "#{rack_env}#{rack_env != branch && "-#{branch}"}").gsub(STACK_NAME_INVALID_REGEX, '-')
      end

      # CNAME prefix to use for this stack.
      def cname
        stack_name
      end

      # Fully qualified domain name, with optional pre/postfix.
      # prod_stack_name is used to control partially-migrated resources in production.
      def subdomain(prefix = nil, postfix = nil, prod_stack_name: true)
        name = (rack_env?(:production) && !prod_stack_name) ? nil : cname
        subdomain = [prefix, name, postfix].compact.join('-')
        [subdomain.presence, DOMAIN].compact.join('.').downcase
      end

      def studio_subdomain(prod_stack_name: true)
        subdomain nil, 'studio', prod_stack_name: prod_stack_name
      end

      def adhoc_image_id
        cfn.describe_stacks(stack_name: 'AMI-adhoc').
          stacks.first.outputs.
          find {|o| o.output_key == 'AMI'}.
          output_value
      end

      # Validates that the template is valid CloudFormation syntax.
      # Does not check validity of the resource properties, just the base syntax.
      # First prints the JSON-formatted template, then either raises an error (if invalid)
      # or prints the template description (if valid).
      def validate
        template = render_template(dry_run: true)
        CDO.log.info template if ENV['VERBOSE']
        template_info = string_or_url(template)
        CDO.log.info cfn.validate_template(template_info).description
        params = parameters(template).reject {|x| x[:parameter_value].nil?}
        CDO.log.info "Parameters:\n#{params.map {|p| "#{p[:parameter_key]}: #{p[:parameter_value]}"}.join("\n")}" unless params.empty?

        if stack_exists?
          CDO.log.info "Listing changes to existing stack `#{stack_name}`:"
          change_set_id = cfn.create_change_set(
            stack_options(template).merge(
              change_set_name: "#{stack_name}-#{Digest::MD5.hexdigest(template)}"
            )
          ).id

          begin
            change_set = {changes: []}
            loop do
              sleep 1
              change_set = cfn.describe_change_set(
                change_set_name: change_set_id,
                stack_name: stack_name
              )
              break unless %w(CREATE_PENDING CREATE_IN_PROGRESS).include?(change_set.status)
            end
            change_set.changes.each do |change|
              c = change.resource_change
              str = "#{c.action} #{c.logical_resource_id} [#{c.resource_type}] #{c.scope.join(', ')}"
              str += " Replacement: #{c.replacement}" if %w(True Conditional).include?(c.replacement)
              str += " (#{c.details.map {|d| d.target.name}.join(', ')})" if c.details.any?
              CDO.log.info str
            end
            CDO.log.info 'No changes' if change_set.changes.empty?

          ensure
            cfn.delete_change_set(
              change_set_name: change_set_id,
              stack_name: stack_name
            )
          end
        end
      end

      # Returns an inline string or S3 URL depending on the size of the template.
      def string_or_url(template)
        # Upload the template to S3 if it's too large to be passed directly.
        if template.length < 51200
          {template_body: template}
        elsif template.length < 460800
          CDO.log.debug 'Uploading template to S3...'
          key = AWS::S3.upload_to_bucket(TEMP_BUCKET, "#{stack_name}-#{Digest::MD5.hexdigest(template)}-cfn.json", template, no_random: true)
          {template_url: "https://s3.amazonaws.com/#{TEMP_BUCKET}/#{key}"}
        else
          raise 'Template is too large'
        end
      end

      def parameters(template)
        params = YAML.load(template)['Parameters']
        return [] unless params
        params.keys.map do |key|
          value = CDO[key.underscore] || ENV[key.underscore.upcase]
          if value
            {
              parameter_key: key,
              parameter_value: value
            }
          elsif stack_exists?
            {
              parameter_key: key,
              use_previous_value: true
            }
          else
            nil
          end
        end.compact
      end

      def stack_options(template)
        {
          stack_name: stack_name,
          parameters: parameters(template)
        }.merge(string_or_url(template)).tap do |options|
          if %w[IAM lambda].include? stack_name
            options[:capabilities] = %w[
              CAPABILITY_IAM
              CAPABILITY_NAMED_IAM
            ]
          end
        end
      end

      def create_or_update
        $stdout.sync = true
        template = render_template
        action = stack_exists? ? :update : :create
        CDO.log.info "#{action} stack: #{stack_name}..."
        start_time = Time.now
        options = stack_options(template)
        if action == :create
          options[:on_failure] = 'DO_NOTHING'
          if daemon
            options[:role_arn] = "arn:aws:iam::#{Aws::STS::Client.new.get_caller_identity.account}:role/CloudFormationRole"
          end
        end
        begin
          updated_stack_id = cfn.method("#{action}_stack").call(options).stack_id
        rescue Aws::CloudFormation::Errors::ValidationError => e
          if e.message == 'No updates are to be performed.'
            CDO.log.info e.message
            return
          else
            raise e
          end
        end
        wait_for_stack(action, start_time)
        unless ENV['QUIET']
          CDO.log.info 'Outputs:'
          cfn.describe_stacks(stack_name: updated_stack_id).stacks.first.outputs.each do |output|
            CDO.log.info "#{output.output_key}: #{output.output_value}"
          end
        end
      end

      def delete
        if stack_exists?
          CDO.log.info "Shutting down #{stack_name}..."
          start_time = Time.now
          cfn.delete_stack(stack_name: stack_name)
          wait_for_stack(:delete, start_time)
        else
          CDO.log.warn "Stack #{stack_name} does not exist."
        end
      end

      private

      def cfn
        @@cfn ||= Aws::CloudFormation::Client.new
      end

      def logs
        @@logs ||= Aws::CloudWatchLogs::Client.new
      end

      # Only way to determine whether a given stack exists using the Ruby API.
      def stack_exists?
        @@stack_exists ||= begin
            !!cfn.describe_stacks(stack_name: stack_name)
          rescue Aws::CloudFormation::Errors::ValidationError => e
            raise e unless e.message == "Stack with id #{stack_name} does not exist"
            false
          end
      end

      def update_certs
        Dir.chdir(aws_dir('cloudformation')) do
          RakeUtils.bundle_exec './update_certs', subdomain
        end
      end

      def update_cookbooks
        if CDO.chef_local_mode
          RakeUtils.with_bundle_dir(cookbooks_dir) do
            Tempfile.open('berks') do |tmp|
              RakeUtils.bundle_exec 'berks', 'package', tmp.path
              Aws::S3::Client.new.put_object(
                bucket: S3_BUCKET,
                key: "#{CHEF_KEY}/#{branch}.tar.gz",
                body: tmp.read
              )
            end
          end
        end
      end

      def update_bootstrap_script
        Aws::S3::Client.new.put_object(
          bucket: S3_BUCKET,
          key: "#{CHEF_KEY}/bootstrap-#{stack_name}.sh",
          body: File.read(aws_dir('chef-bootstrap.sh'))
        )
      end

      # Prints the latest output from a CloudWatch Logs log stream, if present.
      def tail_log(quiet: false)
        log_config = {
          log_group_name: stack_name,
          log_stream_name: LOG_NAME
        }
        log_config[:next_token] = @@log_token unless @@log_token.nil?
        # Return silently if we can't get the log events for any reason.
        resp = logs.get_log_events(log_config) rescue return
        resp.events.each do |event|
          CDO.log.info(event.message) unless quiet
        end
        @@log_token = resp.next_forward_token
      end

      # Prints the latest CloudFormation stack events.
      def tail_events(stack_id, resource_filter = [])
        stack_events = cfn.describe_stack_events(stack_name: stack_id).stack_events
        stack_events.reject! do |event|
          event.timestamp <= @@event_timestamp ||
            resource_filter.include?(event.logical_resource_id)
        end
        stack_events.sort_by(&:timestamp).each do |event|
          str = "#{event.logical_resource_id} [#{event.resource_status}]"
          str = "#{str}: #{event.resource_status_reason}" if event.resource_status_reason
          str = "#{event.timestamp}- #{str}" unless ENV['QUIET']
          CDO.log.info str
          if event.resource_status == 'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS'
            throw :success
          end
        end
        @@event_timestamp = ([@@event_timestamp] + stack_events.map(&:timestamp)).max
      end

      def wait_for_stack(action, start_time)
        CDO.log.info "Stack #{action} requested, waiting for provisioning to complete..."
        stack_id = stack_name
        begin
          @@event_timestamp = start_time
          @@log_token = nil
          tail_log(quiet: true)
          stack_id = cfn.describe_stacks(stack_name: stack_id).stacks.first.stack_id
          cfn.wait_until("stack_#{action}_complete".to_sym, stack_name: stack_id) do |w|
            w.delay = 10 # seconds
            w.max_attempts = 540 # = 1.5 hours
            w.before_wait do
              tail_events(stack_id, log_resource_filter)
              tail_log
              print '.' unless ENV['QUIET']
            end
          end
          tail_events(stack_id, log_resource_filter) rescue nil
          tail_log
        rescue Aws::Waiters::Errors::FailureStateError
          tail_events(stack_id)
          tail_log
          if action == :create
            CDO.log.info 'Stack will remain in its half-created state for debugging. To delete, run `rake adhoc:stop`.'
          end
          raise "\nError on #{action}."
        end
        CDO.log.info "\nStack #{action} complete." unless ENV['QUIET']
        CDO.log.info "Don't forget to clean up AWS resources by running `rake adhoc:stop` after you're done testing your instance!" if action == :create
      end

      def render_template(dry_run: false)
        filename = aws_dir('cloudformation', TEMPLATE)
        template_string = File.read(filename)
        azs = AVAILABILITY_ZONES.map {|zone| zone[-1].upcase}
        @@local_variables = OpenStruct.new(
          dry_run: dry_run,
          local_mode: !!CDO.chef_local_mode,
          stack_name: stack_name,
          branch: branch,
          region: CDO.aws_region,
          environment: rack_env,
          ssh_ip: SSH_IP,
          certificate_arn: CERTIFICATE_ARN,
          cdn_enabled: !!ENV['CDN_ENABLED'],
          domain: DOMAIN,
          cname: cname,
          availability_zone: AVAILABILITY_ZONES.first,
          availability_zones: AVAILABILITY_ZONES,
          azs: azs,
          s3_bucket: S3_BUCKET,
          subnets: azs.map {|az| {'Fn::ImportValue': "VPC-Subnet#{az}"}},
          public_subnets: azs.map {|az| {'Fn::ImportValue': "VPC-PublicSubnet#{az}"}},
          lambda_fn: method(:lambda),
          update_certs: method(:update_certs),
          update_cookbooks: method(:update_cookbooks),
          update_bootstrap_script: method(:update_bootstrap_script),
          log_name: LOG_NAME
        )
        erb_eval(template_string, filename)
      end

      # Inline a file into a CloudFormation template.
      def file(filename, vars={})
        str = File.read(filename.start_with?('/') ? filename : aws_dir('cloudformation', filename))
        vars = @@local_variables.dup.to_h.merge(vars)
        {'Fn::Sub': erb_eval(str, filename, vars)}.to_json
      end

      # Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html#cfn-lambda-function-code-zipfile
      LAMBDA_ZIPFILE_MAX = 4096

      # Inline a single javascript file into a CloudFormation template for a Lambda function resource.
      # Raises an error if the minified file is too large.
      # Use UglifyJS to compress code if `uglify` parameter is set.
      def js(filename, uglify=true)
        str = File.read(aws_dir('cloudformation', filename))
        if uglify
          str = Dir.chdir(aws_dir('cloudformation')) do
            RakeUtils.npm_install
            `$(npm bin)/uglifyjs --compress --mangle -- #{filename}`
          end
        end
        if str.length > LAMBDA_ZIPFILE_MAX
          raise "Length of JavaScript file '#{filename}' (#{str.length}) cannot exceed #{LAMBDA_ZIPFILE_MAX} characters."
        end
        erb_eval(str, filename).to_json
      end

      # Zip an array of JS files (along with the `node_modules` folder), and upload to S3.
      def js_zip(files)
        hash = nil
        code_zip = Dir.chdir(aws_dir('cloudformation')) do
          RakeUtils.npm_install '--production'
          # Zip files contain non-deterministic timestamps, so calculate a deterministic hash based on file contents.
          hash = Digest::MD5.hexdigest(
            Dir[*files, 'node_modules/**/*'].
              select(&File.method(:file?)).
              sort.
              map(&Digest::MD5.method(:file)).
              join
          )
          `zip -qr - #{files.join(' ')} node_modules`
        end
        key = "lambdajs-#{hash}.zip"
        object_exists = Aws::S3::Client.new.head_object(bucket: S3_BUCKET, key: key) rescue nil
        unless object_exists
          CDO.log.info("Uploading Lambda zip package to S3 (#{code_zip.length} bytes)...")
          AWS::S3.upload_to_bucket(S3_BUCKET, key, code_zip, no_random: true)
        end
        {
          S3Bucket: S3_BUCKET,
          S3Key: key
        }.to_json
      end

      # Helper function to call a Lambda-function-based AWS::CloudFormation::CustomResource.
      # Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cfn-customresource.html
      def lambda(function_name, properties={})
        custom_type = properties.delete(:CustomType)
        depends_on = properties.delete(:DependsOn)
        custom_resource = {
          Type: properties.delete('Type') || "Custom::#{custom_type || function_name}",
          Properties: {
            ServiceToken: {'Fn::Join' => [':', [
              'arn:aws:lambda',
              {Ref: 'AWS::Region'},
              {Ref: 'AWS::AccountId'},
              'function',
              function_name
            ]]}
          }.merge(properties)
        }
        custom_resource['DependsOn'] = depends_on if depends_on
        custom_resource.to_json
      end

      def erb_eval(str, filename=nil, local_vars=nil)
        local_vars ||= @@local_variables
        local_binding = binding
        local_vars.each_pair do |key, value|
          local_binding.local_variable_set(key, value)
        end
        ERB.new(str, nil, '-').tap {|erb| erb.filename = filename}.result(local_binding)
      end
    end
  end
end
