require_relative '../../../deployment'
require 'cdo/rake_utils'
require 'aws-sdk'
require 'json'
require 'yaml'
require 'erb'
require 'tempfile'

# Manages application-specific configuration and deployment of AWS CloudFront distributions.
module AWS
  class CloudFormation

    # Hard-coded values for our CloudFormation template.

    DOMAIN = 'cdn-code.org'
    STACK_NAME = "#{rack_env}-#{RakeUtils.git_branch}"
    # Fully qualified domain name
    FQDN = "#{STACK_NAME}.#{DOMAIN}"
    SSH_KEY_NAME = 'server_access_key'
    IMAGE_ID = 'ami-df0607b5'
    INSTANCE_TYPE = 'c4.xlarge'
    SSH_IP = '0.0.0.0/0'
    S3_BUCKET = 'cdo-dist'

    # Use AWS Certificate Manager for ELB and CloudFront SSL certificates.
    ACM_REGION = 'us-east-1'
    CERTIFICATE_ARN = Aws::ACM::Client.new(region: ACM_REGION).
      list_certificates(certificate_statuses: ['ISSUED']).
      certificate_summary_list.
      find { |cert| cert.domain_name == "*.#{DOMAIN}" }.
      certificate_arn

    class << self
      # Validates that the template is valid CloudFormation syntax.
      # Does not check validity of the resource properties, just the base syntax.
      # First prints the JSON-formatted template, then either raises an error (if invalid)
      # or prints the template description (if valid).
      def validate(cdn_enabled: false)
        json_template = json_template(cdn_enabled: cdn_enabled)
        CDO.log.info JSON.pretty_generate(JSON.parse(json_template))
        CDO.log.info cfn.validate_template(
          template_body: json_template
        ).description
      end

      def create_or_update(cdn_enabled: false)
        json_template = json_template(cdn_enabled: cdn_enabled)

        update_certs
        update_cookbooks
        update_bootstrap_script

        action = stack_exists? ? :update : :create
        CDO.log.info "#{action} stack: #{STACK_NAME}..."
        start_time = Time.now
        updated_stack_id = cfn.method("#{action}_stack").call(
          stack_name: STACK_NAME,
          template_body: json_template,
          capabilities: ['CAPABILITY_IAM']
        ).stack_id
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
              Aws::S3::Client.new(region: CDO.aws_region).put_object(
                bucket: S3_BUCKET,
                key: "chef/#{RakeUtils.git_branch}.tar.gz",
                body: tmp.read
              )
            end
          end
        end
      end

      def update_bootstrap_script
        Aws::S3::Client.new.put_object(
          bucket: S3_BUCKET,
          key: 'chef/bootstrap.sh',
          body: File.read(aws_dir('chef-bootstrap.sh'))
        )
      end

      def wait_for_stack(action, start_time)
        CDO.log.info "Stack #{action} requested, waiting for instance provisioning to complete..."
        begin
          cfn.wait_until("stack_#{action}_complete".to_sym, stack_name: STACK_NAME) do |w|
            w.max_attempts = 360 # 1 hour
            w.delay = 10
            w.before_wait { print '.' }
          end
        rescue Aws::Waiters::Errors::FailureStateError
          CDO.log.info "\nError on #{action}. Event log:"
          events = []
          cfn.describe_stack_events(stack_name: STACK_NAME).stack_events.each do |event|
            events << event
            break if event.timestamp < start_time
          end
          events.reject { |event| event.resource_status_reason.nil? }.sort_by(&:timestamp).each do |event|
            puts "#{event.timestamp}- #{event.logical_resource_id} [#{event.resource_status}]: #{event.resource_status_reason}"
          end
          return
        end
        CDO.log.info "\nStack #{action} complete."
      end

      def json_template(cdn_enabled:)
        template_string = File.read(aws_dir('cloudformation', 'cloud_formation_adhoc_standalone.yml.erb'))
        @@local_variables = OpenStruct.new(
          local_mode: !!CDO.chef_local_mode,
          stack_name: STACK_NAME,
          ssh_key_name: SSH_KEY_NAME,
          image_id: IMAGE_ID,
          instance_type: INSTANCE_TYPE,
          branch: RakeUtils.git_branch,
          region: CDO.aws_region,
          environment: rack_env,
          ssh_ip: SSH_IP,
          certificate_arn: CERTIFICATE_ARN,
          cdn_enabled: cdn_enabled,
          domain: DOMAIN,
          subdomain: FQDN,
          availability_zone: Aws::EC2::Client.new.describe_availability_zones.availability_zones.first.zone_name,
          s3_bucket: S3_BUCKET,
          file: method(:file)
        )
        YAML.load(erb_eval(template_string)).to_json
      end

      # Input filename, output ERB-processed file contents in CloudFormation JSON-compatible syntax (using Fn::Join operator).
      def file(filename)
        str = File.read(aws_dir('cloudformation', filename))
        {'Fn::Join' => ["", erb_eval(str).each_line.to_a]}.to_json
      end

      def erb_eval(str)
        ERB.new(str).result(@@local_variables.instance_eval{binding})
      end

    end

  end
end
