require_relative '../../../deployment'
require 'cdo/rake_utils'
require 'aws-sdk'
require 'json'
require 'yaml'
require 'erb'
require 'tempfile'
require 'base64'
require 'uglifier'

# Manages application-specific configuration and deployment of AWS CloudFront distributions.
module AWS
  class CloudFormation

    # Hard-coded values for our CloudFormation template.
    TEMPLATE = ENV['TEMPLATE'] || 'cloud_formation_adhoc_standalone.yml.erb'

    DOMAIN = ENV['DOMAIN'] || 'cdn-code.org'

    # Use [DOMAIN] wildcard SSL certificate for ELB and CloudFront, if available.
    IAM_METADATA = Aws::IAM::Client.new.get_server_certificate(server_certificate_name: DOMAIN).
      server_certificate.server_certificate_metadata rescue nil

    IAM_CERTIFICATE_ID = IAM_METADATA && IAM_METADATA.server_certificate_id

    # Lookup ACM certificate for ELB and CloudFront SSL, if IAM-based certificate is not available.
    ACM_REGION = 'us-east-1'
    CERTIFICATE_ARN = IAM_METADATA ? IAM_METADATA.arn :
      Aws::ACM::Client.new(region: ACM_REGION).
      list_certificates(certificate_statuses: ['ISSUED']).
      certificate_summary_list.
      find { |cert| cert.domain_name == "*.#{DOMAIN}" }.
      certificate_arn

    BRANCH = ENV['branch'] || (rack_env?(:adhoc) ? RakeUtils.git_branch : rack_env)

    # A stack name can contain only alphanumeric characters (case sensitive) and hyphens.
    # Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-using-console-create-stack-parameters.html
    STACK_NAME_INVALID_REGEX = /[^[:alnum:]-]/
    STACK_NAME = (ENV['STACK_NAME'] || "#{rack_env}-#{BRANCH}").gsub(STACK_NAME_INVALID_REGEX, '-')

    # Fully qualified domain name
    FQDN = "#{STACK_NAME}.#{DOMAIN}".downcase
    SSH_KEY_NAME = 'server_access_key'
    IMAGE_ID = 'ami-df0607b5' # ubuntu/images/hvm-ssd/ubuntu-trusty-14.04-amd64-server-*
    INSTANCE_TYPE = ENV['INSTANCE_TYPE'] || 't2.large'
    SSH_IP = '0.0.0.0/0'
    S3_BUCKET = 'cdo-dist'
    CDN_ENABLED = !!ENV['CDN_ENABLED']

    STACK_ERROR_LINES = 250
    LOG_NAME = '/var/log/bootstrap.log'

    class << self
      # Validates that the template is valid CloudFormation syntax.
      # Does not check validity of the resource properties, just the base syntax.
      # First prints the JSON-formatted template, then either raises an error (if invalid)
      # or prints the template description (if valid).
      def validate
        template = json_template(dry_run: true)
        CDO.log.info JSON.pretty_generate(JSON.parse(template))
        CDO.log.info cfn.validate_template(
          template_body: template
        ).description
      end

      def create_or_update
        template = json_template
        action = stack_exists? ? :update : :create
        CDO.log.info "#{action} stack: #{STACK_NAME}..."
        start_time = Time.now
        stack_options = {
          stack_name: STACK_NAME,
          template_body: template,
          capabilities: ['CAPABILITY_IAM']
        }
        stack_options[:on_failure] = 'DO_NOTHING' if action == :create
        updated_stack_id = cfn.method("#{action}_stack").call(stack_options).stack_id
        wait_for_stack(action, start_time)
        CDO.log.info 'Outputs:'
        cfn.describe_stacks(stack_name: updated_stack_id).stacks.first.outputs.each do |output|
          CDO.log.info "#{output.output_key}: #{output.output_value}"
        end
      end

      def delete
        if stack_exists?
          CDO.log.info "Shutting down #{STACK_NAME}..."
          start_time = Time.now
          cfn.delete_stack(stack_name: STACK_NAME)
          wait_for_stack(:delete, start_time)
        else
          CDO.log.warn "Stack #{STACK_NAME} does not exist."
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
        !!cfn.describe_stacks(stack_name: STACK_NAME)
      rescue Aws::CloudFormation::Errors::ValidationError => e
        raise e unless e.message == "Stack with id #{STACK_NAME} does not exist"
        false
      end

      def update_certs
        Dir.chdir(aws_dir('cloudformation')) do
          RakeUtils.bundle_exec './update_certs', FQDN
        end
      end

      def update_cookbooks
        if CDO.chef_local_mode
          RakeUtils.with_bundle_dir(cookbooks_dir) do
            Tempfile.open('berks') do |tmp|
              RakeUtils.bundle_exec 'berks', 'package', tmp.path
              client = Aws::S3::Client.new(region: CDO.aws_region,
                                           credentials: Aws::Credentials.new(CDO.aws_access_key, CDO.aws_secret_key))
              client.put_object(
                bucket: S3_BUCKET,
                key: "chef/#{BRANCH}.tar.gz",
                body: tmp.read
              )
            end
          end
        end
      end

      def update_bootstrap_script
        Aws::S3::Client.new.put_object(
          bucket: S3_BUCKET,
          key: "chef/bootstrap-#{STACK_NAME}.sh",
          body: File.read(aws_dir('chef-bootstrap.sh'))
        )
      end

      # Prints the latest output from a CloudWatch Logs log stream, if present.
      def tail_log(quiet: false)
        return if @@log_token.nil? && logs.describe_log_streams(log_group_name: STACK_NAME, log_stream_name_prefix: LOG_NAME, limit: 1).log_streams.none?
        log_config = {
          log_group_name: STACK_NAME,
          log_stream_name: LOG_NAME
        }
        log_config[:next_token] = @@log_token unless @@log_token.nil?
        resp = logs.get_log_events(log_config)
        resp.events.each do |event|
          CDO.log.info(event.message) unless quiet
        end
        @@log_token = resp.next_forward_token
      end

      # Prints the latest CloudFormation stack events.
      def tail_events(stack_id)
        stack_events = cfn.describe_stack_events(stack_name: stack_id).stack_events
        stack_events.reject{|event| event.timestamp <= @@event_timestamp}.sort_by(&:timestamp).each do |event|
          CDO.log.info "#{event.timestamp}- #{event.logical_resource_id} [#{event.resource_status}]: #{event.resource_status_reason}"
        end
        @@event_timestamp = stack_events.map(&:timestamp).max
      end

      def wait_for_stack(action, start_time)
        CDO.log.info "Stack #{action} requested, waiting for provisioning to complete..."
        stack_id = STACK_NAME
        begin
          @@event_timestamp = start_time
          @@log_token = nil
          tail_log(quiet: true)
          stack_id = cfn.describe_stacks(stack_name: stack_id).stacks.first.stack_id
          cfn.wait_until("stack_#{action}_complete".to_sym, stack_name: stack_id) do |w|
            w.max_attempts = 360 # 1 hour
            w.delay = 10
            w.before_wait do
              tail_events(stack_id)
              tail_log
              print '.'
            end
          end
          tail_events(stack_id)
          tail_log
        rescue Aws::Waiters::Errors::FailureStateError
          tail_events(stack_id)
          tail_log
          CDO.log.info "\nError on #{action}."
          if action == :create
            CDO.log.info 'Stack will remain in its half-created state for debugging. To delete, run `rake adhoc:stop`.'
          end
          return
        end
        CDO.log.info "\nStack #{action} complete."
        CDO.log.info "Don't forget to clean up AWS resources by running `rake adhoc:stop` after you're done testing your instance!" if action == :create
      end

      def json_template(dry_run: false)
        template_string = File.read(aws_dir('cloudformation', TEMPLATE))
        availability_zones = Aws::EC2::Client.new.describe_availability_zones.availability_zones.map(&:zone_name)
        azs = availability_zones.map { |zone| zone[-1].upcase }
        @@local_variables = OpenStruct.new(
          dry_run: dry_run,
          local_mode: !!CDO.chef_local_mode,
          stack_name: STACK_NAME,
          ssh_key_name: SSH_KEY_NAME,
          image_id: IMAGE_ID,
          instance_type: INSTANCE_TYPE,
          branch: BRANCH,
          region: CDO.aws_region,
          environment: rack_env,
          ssh_ip: SSH_IP,
          iam_certificate_id: IAM_CERTIFICATE_ID,
          certificate_arn: CERTIFICATE_ARN,
          cdn_enabled: CDN_ENABLED,
          domain: DOMAIN,
          subdomain: FQDN,
          availability_zone: availability_zones.first,
          availability_zones: availability_zones,
          azs: azs,
          s3_bucket: S3_BUCKET,
          file: method(:file),
          js: method(:js),
          subnets: azs.map{|az| {'Fn::GetAtt' => ['VPC', "Subnet#{az}"]}}.to_json,
          public_subnets: azs.map{|az| {'Fn::GetAtt' => ['VPC', "PublicSubnet#{az}"]}}.to_json,
          lambda: method(:lambda),
          update_certs: method(:update_certs),
          update_cookbooks: method(:update_cookbooks),
          update_bootstrap_script: method(:update_bootstrap_script)
        )
        erb_output = erb_eval(template_string)
        YAML.load(erb_output).to_json
      end

      # Input string, output ERB-processed file contents in CloudFormation JSON-compatible syntax (using Fn::Join operator).
      def source(str, vars={})
        local_vars = @@local_variables.dup
        vars.each { |k, v| local_vars[k] = v }
        lines = erb_eval(str, local_vars).each_line.map do |line|
          # Support special %{"Key": "Value"} syntax for inserting Intrinsic Functions into processed file contents.
          line.split(/(%{.*})/).map do |x|
            x =~ /%{.*}/ ? JSON.parse(x.gsub(/%({.*})/, '\1')) : x
          end
        end.flatten
        {'Fn::Join' => ['', lines]}.to_json
      end

      # Inline a file into a CloudFormation template.
      def file(filename, vars={})
        str = File.read(aws_dir('cloudformation', filename))
        source(str, vars)
      end

      # Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html#cfn-lambda-function-code-zipfile
      LAMBDA_ZIPFILE_MAX = 4096

      # Inline a javascript file into a CloudFormation template for a Lambda function resource.
      # Raises an error if the minified file is too large.
      # Use UglifyJS to compress code if `uglify` parameter is set.
      def js(filename, uglify=true)
        str = File.read(aws_dir('cloudformation', filename))
        str = Uglifier.compile(str) if uglify
        if str.length > LAMBDA_ZIPFILE_MAX
          raise "Length of JavaScript file '#{filename}' (#{str.length}) cannot exceed #{LAMBDA_ZIPFILE_MAX} characters."
        end
        source(str)
      end

      # Helper function to call a Lambda-function-based AWS::CloudFormation::CustomResource.
      # Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cfn-customresource.html
      def lambda(function_name, properties={})
        depends_on = properties.delete(:DependsOn)
        custom_resource = {
          Type: properties.delete('Type') || "Custom::#{function_name}",
          Properties: {
            ServiceToken: {'Fn::Join' => [':',[
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

      def erb_eval(str, local_vars=nil)
        local_vars ||= @@local_variables
        ERB.new(str, nil, '-').result(local_vars.instance_eval{binding})
      end

    end

  end
end
