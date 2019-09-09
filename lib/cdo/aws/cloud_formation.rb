require_relative '../../../deployment'
require 'active_support/core_ext/string/inflections'
require 'active_support/core_ext/object/blank'
require 'cdo/rake_utils'
require 'aws-sdk-cloudformation'
require 'aws-sdk-acm'
require 'aws-sdk-s3'
require 'aws-sdk-ec2'
require 'aws-sdk-cloudwatchlogs'
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
    TEMPLATE = ENV['TEMPLATE'] || raise('Stack template not provided in environment (TEMPLATE=[stack].yml.erb)')
    TEMPLATE_POLICY = TEMPLATE.split('.').tap {|s| s.first << '-policy'}.join('.')
    TEMP_BUCKET = ENV['TEMP_S3_BUCKET'] || 'cf-templates-p9nfb0gyyrpf-us-east-1'
    # number of seconds to configure as Time To Live for DNS record
    DNS_TTL = 60

    DOMAIN = ENV['DOMAIN'] || 'cdn-code.org'

    # A stack name can contain only alphanumeric characters (case sensitive) and hyphens.
    # Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-using-console-create-stack-parameters.html
    STACK_NAME_INVALID_REGEX = /[^[:alnum:]-]/

    SSH_KEY_NAME = 'server_access_key'.freeze
    IMAGE_ID = ENV['IMAGE_ID'] || 'ami-c8580bdf' # ubuntu/images/hvm-ssd/ubuntu-trusty-14.04-amd64-server-*
    INSTANCE_TYPE = rack_env?(:production) ? 'm4.10xlarge' : 't2.2xlarge'
    SSH_IP = '0.0.0.0/0'.freeze
    S3_BUCKET = 'cdo-dist'.freeze
    CHEF_KEY = rack_env?(:adhoc) ? 'adhoc/chef' : 'chef'

    AVAILABILITY_ZONES = ('b'..'e').map {|i| "us-east-1#{i}"}

    STACK_ERROR_LINES = 250
    LOG_NAME = '/var/log/bootstrap.log'.freeze

    class << self
      attr_accessor :daemon
      attr_accessor :daemon_instance_id
      attr_accessor :log_resource_filter
      CloudFormation.log_resource_filter = []

      def branch
        ENV['branch'] || (rack_env?(:adhoc) ? RakeUtils.git_branch : rack_env)
      end

      def stack_name
        name = ENV['STACK_NAME'] || CDO.stack_name
        name += "-#{branch}" if name == 'adhoc'
        name.gsub(STACK_NAME_INVALID_REGEX, '-')
      end

      # CNAME prefix to use for this stack.
      def cname
        stack_name
      end

      # Fully qualified domain name, with optional pre/postfix.
      def subdomain(prefix = nil, postfix = nil)
        subdomain = [prefix, cname, postfix].compact.join('-')
        [subdomain.presence, DOMAIN].compact.join('.').downcase
      end

      def studio_subdomain
        subdomain nil, 'studio'
      end

      def adhoc_image_id
        cfn.describe_stacks(stack_name: 'AMI-adhoc').
          stacks.first.outputs.
          find {|o| o.output_key == 'AMI'}.
          output_value
      end

      # Lookup ACM certificate for ELB and CloudFront SSL.
      # Choose latest expiration among multiple active matching certificates.
      ACM_REGION = 'us-east-1'.freeze
      def certificate_arn
        acm = Aws::ACM::Client.new(region: ACM_REGION)
        wildcard = "*.#{DOMAIN}"
        acm.
          list_certificates(certificate_statuses: ['ISSUED']).
          certificate_summary_list.
          select {|cert| cert.domain_name == wildcard || cert.domain_name == DOMAIN}.
          map {|cert| acm.describe_certificate(certificate_arn: cert.certificate_arn).certificate}.
          select {|cert| cert.subject_alternative_names.include? wildcard}.
          max_by(&:not_after).
          certificate_arn
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
        options = stack_options(template)
        params = options[:parameters].reject {|x| x[:parameter_value].nil?}
        CDO.log.info "Parameters:\n#{params.map {|p| "#{p[:parameter_key]}: #{p[:parameter_value]}"}.join("\n")}" unless params.empty?

        if stack_exists?
          CDO.log.info "Listing changes to existing stack `#{stack_name}`:"
          change_set_id = cfn.create_change_set(
            options.merge(
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
        params.map do |key, properties|
          value = CDO[key.underscore] || ENV[key.underscore.upcase]
          param = {parameter_key: key}
          if value
            param[:parameter_value] = value
          elsif stack_exists? && @@stack.parameters.any? {|p| p.parameter_key == key}
            param[:use_previous_value] = true
          elsif properties['Default']
            next # use default param
          else
            # Required parameter value not found in environment, existing stack or default.
            # Ask for input directly.
            require 'highline'
            param[:parameter_value] = HighLine.new.ask("Enter value for Parameter #{key}:", String)
          end
          param
        end.compact
      end

      def stack_options(template)
        {
          stack_name: stack_name,
          parameters: parameters(template),
          tags: [
            {
              key: 'environment',
              value: rack_env
            }
          ],
        }.merge(string_or_url(template)).tap do |options|
          options[:capabilities] = %w[
            CAPABILITY_IAM
            CAPABILITY_NAMED_IAM
          ]
          if rack_env?(:adhoc)
            options[:tags].push(
              key: 'owner',
              value: Aws::STS::Client.new.get_caller_identity.arn
            )
          end

          # All stacks use the same shared Service Role for CloudFormation resource-management permissions.
          # Pass `ADMIN=1` to update admin resources with a privileged Service Role.
          role_name = "CloudFormation#{ENV['ADMIN'] ? 'Admin' : 'Service'}"
          account = Aws::STS::Client.new.get_caller_identity.account
          options[:role_arn] = "arn:aws:iam::#{account}:role/admin/#{role_name}"
        end
      end

      def create_or_update
        $stdout.sync = true
        template = render_template
        action = stack_exists? ? :update : :create
        CDO.log.info "#{action} stack: #{stack_name}..."
        start_time = Time.now
        options = stack_options(template)
        if File.file?(aws_dir('cloudformation', TEMPLATE_POLICY))
          stack_policy = JSON.pretty_generate(YAML.load(render_template(template: TEMPLATE_POLICY)))
          options[:stack_policy_body] = stack_policy
          options[:stack_policy_during_update_body] = stack_policy if action == :update
        end
        options[:on_failure] = 'DO_NOTHING' if action == :create

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

      def start_inactive_instance
        cloudformation_resource = Aws::CloudFormation::Resource.new
        stack = cloudformation_resource.stack(stack_name)
        instance = Aws::EC2::Instance.new(id: stack.resource('WebServer').physical_resource_id)
        if instance.state.code != 80
          CDO.log.info "Instance #{instance.id} in Stack #{stack_name} can't be started because it is not" \
          " currently stopped.  Current state - #{instance.state.code}:#{instance.state.name}"
        else
          CDO.log.info "Starting Instance #{instance.id} ..."
          instance.start
          instance.wait_until_running
          CDO.log.info "Instance #{instance.id} is started."

          public_ip_address = instance.reload.public_ip_address
          dashboard_url = stack.outputs.detect {|output| output.output_key == 'DashboardURL'}.output_value
          pegasus_url = stack.outputs.detect {|output| output.output_key == 'PegasusURL'}.output_value

          # suffix period to construct fully qualified domain name
          pegasus_domain_name = URI.parse(pegasus_url).host + '.'
          dashboard_domain_name = URI.parse(dashboard_url).host + '.'

          route53_client = Aws::Route53::Client.new

          # this lookup may stop working if/when there are more than 100 zones
          # prefix zone name with a period to prevent partial match (don't let zone "code.org." match "foo.cdn-code.org.")
          hosted_zone_id = route53_client.
            list_hosted_zones.
            hosted_zones.
            select {|zone| pegasus_domain_name.end_with?('.' + zone.name)}.
            first.
            id

          change_resource_response = route53_client.change_resource_record_sets(
            {
              change_batch: {
                changes: [
                  {
                    action: "UPSERT",
                    resource_record_set: {
                      name: pegasus_domain_name,
                      resource_records: [
                        {
                          value: public_ip_address,
                        },
                      ],
                      ttl: DNS_TTL,
                      type: "A",
                    },
                  },
                  {
                    action: "UPSERT",
                    resource_record_set: {
                      name: dashboard_domain_name,
                      resource_records: [
                        {
                          value: public_ip_address,
                        },
                      ],
                      ttl: DNS_TTL,
                      type: "A",
                    }
                  }
                ],
                comment: "Web server for adhoc environment #{pegasus_domain_name}",
              },
              hosted_zone_id: hosted_zone_id
            }
          )
        end

        change_status = change_resource_response.change_info.status
        change_id = change_resource_response.change_info.id
        CDO.log.info "DNS update status - #{change_status}"
        CDO.log.info "Waiting for AWS Route53 to apply updated DNS records to all of its servers."
        route53_client.wait_until(:resource_record_sets_changed, {id: change_id})
        change_status = route53_client.get_change({id: change_id}).change_info.status
        CDO.log.info "DNS update status - #{change_status}"
        CDO.log.info "Wait up to the configured Time To Live (#{DNS_TTL} seconds) to lookup new IP address."
        stack.outputs.each do |output|
          CDO.log.info "#{output.output_key}: #{output.output_value}"
        end
      end

      def stop
        if stack_exists?
          CDO.log.info "Finding EC2 Instance for CloudFormation Stack #{stack_name} ..."
          cloudformation_resource = Aws::CloudFormation::Resource.new
          stack = cloudformation_resource.stack(stack_name)
          instance_id = stack.resource('WebServer').physical_resource_id
          instance = Aws::EC2::Instance.new(id: instance_id)
          if instance.nil?
            CDO.log.info "Instance #{instance_id} does not exist or has been terminated."\
              "Delete this unrecoverable CloudFormation stack: rake adhoc:delete STACK_NAME=#{stack_name}"
          elsif instance.state.code == 80 # already Stopped
            CDO.log.info "Instance #{instance.id} is already Stopped."
          elsif instance.state.code == 16 # Running
            CDO.log.info "Stopping Instance #{instance.id} ..."
            stop_result = instance.stop
            CDO.log.info "Instance Status - #{stop_result.stopping_instances[0].current_state.name}"
            CDO.log.info "Waiting until Stopped ..."
            instance.wait_until_stopped
            CDO.log.info "Instance Status - #{instance.reload.state.name}"
            CDO.log.info "To start instance: rake adhoc:start_inactive_instance STACK_NAME=#{stack_name}"
          else
            CDO.log.info "Cannot stop Instance because its state is #{instance.state.name}"
          end
        else
          CDO.log.warn "Stack #{stack_name} does not exist."
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
        !!@@stack ||= begin
          cfn.describe_stacks(stack_name: stack_name).stacks.first
        rescue Aws::CloudFormation::Errors::ValidationError => e
          raise e unless e.message == "Stack with id #{stack_name} does not exist"
          false
        end
      end

      def update_certs
        Dir.chdir(aws_dir('cloudformation')) do
          RakeUtils.bundle_exec './update_certs',
            subdomain,
            studio_subdomain,
            subdomain('origin')
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
        CDO.log.info "Don't forget to remove AWS resources by running `rake adhoc:delete` after you're done testing your instance!" if action == :create
      end

      def render_template(template: TEMPLATE, dry_run: false)
        filename = aws_dir('cloudformation', template)
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

      def erb_file(filename, vars={})
        file = File.expand_path filename
        str = File.read(file)
        vars = @@local_variables.dup.to_h.merge(vars)
        erb_eval(str, file, vars)
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
          Aws::S3::Client.new(http_read_timeout: 30).
              put_object({bucket: S3_BUCKET, key: key, body: code_zip})
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

      # Generate boilerplate Trust Policy for an AWS Service Role.
      def service_role(service)
        document = {
          Statement: [
            Effect: 'Allow',
            Action: 'sts:AssumeRole',
            Principal: {Service: ["#{service}.amazonaws.com"]}
          ]
        }
        "AssumeRolePolicyDocument: #{document.to_json}"
      end
    end
  end
end
