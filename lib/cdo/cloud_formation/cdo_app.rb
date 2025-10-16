require_relative './stack_template'
require_relative './vpc'

require 'aws-sdk-acm'
require 'aws-sdk-route53'

require 'active_support/core_ext/numeric/bytes'
require 'ostruct'
require 'tempfile'

require 'cdo/aws/cloudfront'
require 'cdo/cron'
require 'cdo/rake_utils'

module Cdo::CloudFormation
  # Stack-template context with logic specific to the monolithic Code.org application stack.
  class CdoApp < StackTemplate
    include VPC

    if rack_env?(:adhoc)
      require_relative './adhoc'
      AWS::CloudFormation.include Adhoc
      require_relative './tail_logs'
      AWS::CloudFormation.prepend TailLogs
    end

    # Hard-coded constants and default values.
    CHEF_BIN = '/usr/local/bin/chef-cdo-app'
    CHEF_KEY = rack_env?(:adhoc) ? 'adhoc/chef' : 'chef'
    # Use AMI for Ubuntu 20 (ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-20230517)
    IMAGE_ID = ENV['IMAGE_ID'] || 'ami-0261755bbcb8c4a84'
    ORIGIN = "https://github.com/code-dot-org/code-dot-org.git"
    CHEF_VERSION = '17.6.18'
    DOMAIN = 'cdn-code.org'
    SSH_KEY_NAME = 'server_access_key'.freeze
    S3_BUCKET = 'cdo-dist'.freeze
    BOOTSTRAP_CHEF = aws_dir('cloudformation/bootstrap_chef_stack.sh.erb')

    # number of seconds to configure as Time To Live for DNS record
    DNS_TTL = 60

    attr_reader :daemon

    # Struct providing arbitrary configuration options used by the template.
    # @return [OpenStruct]
    attr_reader :options

    delegate :commit, :frontends, :database, :load_balancer, :alarms, :cdn_enabled, :branch, :domain,
      to: :options

    def initialize(**options)
      options[:stack_name]  ||= CDO.stack_name
      options[:filename]    ||= 'cloud_formation_stack.yml.erb'
      super(**options)
      options = @options = OpenStruct.new(options)

      # For adhoc stacks only (for now), preserve initial options via 'Op:' CloudFormation tags
      if rack_env?(:adhoc)
        read_existing_stack_op_tags.each {|key, val| options[key] = val if options[key].nil?}
      end

      # Various option defaults.
      options.frontends     ||= rack_env?(:production)
      options.database      ||= [:staging, :test, :levelbuilder, :production].include?(rack_env)
      options.load_balancer ||= !rack_env?(:adhoc) || options.frontends
      options.alarms        ||= !rack_env?(:adhoc)
      options.cdn_enabled   ||= !rack_env?(:adhoc)
      options.branch        ||= (rack_env?(:adhoc) ? RakeUtils.git_branch : rack_env)
      options.commit        ||= `git ls-remote origin #{branch}`.split.first
      options.domain        ||= DOMAIN
      options.console       ||= rack_env?(:production)

      stack_name << "-#{branch}" if stack_name == 'adhoc'
      raise "Stack name must not include 'dashboard'" if stack_name.include?('dashboard')

      # Use alternate legacy EC2 instance resource name for standalone-adhoc stack.
      @daemon = rack_env?(:adhoc) && !frontends ?
                  'WebServer' :
                  'Daemon'

      log_resource_filter.push 'FrontendLaunchConfig', 'ASGCount'
      tags.push(key: 'environment', value: rack_env)
      tags.push(key: 'owner', value: Aws::STS::Client.new.get_caller_identity.arn) if rack_env?(:adhoc)
    end

    def render(*)
      check_branch!
      persist_op_tags
      super
    end

    def check_branch!
      return if dry_run
      if rack_env?(:adhoc) && RakeUtils.git_branch == branch
        # Current branch is the one we're deploying to the adhoc server,
        # so check whether it's up-to-date with the remote before we get any further.
        unless `git remote show '#{ORIGIN}' 2>&1 | grep '(up to date)' | grep '#{branch}' | wc -l`.strip.to_i > 0
          raise "Current adhoc branch (#{branch}) needs to be up-to-date with GitHub branch of the same name, otherwise deploy will fail.
To specify an alternate branch name, run `rake adhoc:start branch=BRANCH`."
        end
      else
        # Either not adhoc or deploying a different branch than the current local one;
        # simply check that the branch exists on GitHub before deploying.
        unless system("git ls-remote --exit-code '#{ORIGIN}' #{branch} > /dev/null")
          raise "Current branch (#{branch}) needs to be pushed to GitHub with the same name, otherwise deploy will fail.
  To specify an alternate branch name, run `rake stack:start branch=BRANCH`."
        end
      end
    end

    # Fully qualified domain name, with optional pre/postfix.
    def subdomain(prefix = nil, postfix = nil)
      subdomain = [prefix, stack_name, postfix].compact.join('-')
      [subdomain.presence, options.domain].compact.join('.').downcase
    end

    def studio_subdomain
      subdomain nil, 'studio'
    end

    # Lookup ACM certificate for ELB and CloudFront SSL.
    # Choose latest expiration among multiple active matching certificates.
    ACM_REGION = 'us-east-1'.freeze
    def certificate_arn
      acm = Aws::ACM::Client.new(region: ACM_REGION)
      wildcard = "*.#{domain}"
      all_certificates = []
      next_token = nil

      # Paginate through all certificate pages
      loop do
        response = acm.list_certificates(
          certificate_statuses: ['ISSUED'],
          next_token: next_token
        )

        all_certificates.concat(response.certificate_summary_list)

        # Break if there are no more pages
        break unless response.next_token
        next_token = response.next_token
      end

      # Process all certificates to find the best match
      selected = all_certificates.
        select {|cert| cert.domain_name == wildcard || cert.domain_name == domain}.
        map {|cert| acm.describe_certificate(certificate_arn: cert.certificate_arn).certificate}.
        select {|cert| cert.subject_alternative_names.include? wildcard}.
        max_by(&:not_after)

      raise "No valid ACM certificate found for domain #{domain}" unless selected

      selected.certificate_arn
    end

    # S3 path to bootstrap script.
    # Note: Uploads bootstrap script to S3 as a side effect.
    def bootstrap_script_path
      @bootstrap_script_path ||= begin
        unless dry_run
          Aws::S3::Client.new.put_object(
            bucket: S3_BUCKET,
            key: "#{CHEF_KEY}/bootstrap-#{stack_name}.sh",
            body: File.read(aws_dir('chef-bootstrap.sh'))
          )
        end
        "s3://$S3_BUCKET/#{CHEF_KEY}/bootstrap-$STACK.sh"
      end
    end

    # S3 path to subdomain SSL certificate.
    # Note: uploads certificate to S3 as a side effect.
    def ssl_certs_path
      @ssl_certs_path ||= begin
        unless dry_run
          Dir.chdir(aws_dir('cloudformation')) do
            RakeUtils.bundle_exec './update_certs',
              subdomain,
              studio_subdomain,
              subdomain('origin')
          end
        end
        "s3://#{S3_BUCKET}/ssl/certs/#{subdomain}"
      end
    end

    # S3 path to cookbook package.
    # Note: uploads cookbooks to S3 as a side effect.
    def cookbooks_path
      return nil unless CDO.chef_local_mode
      @cookbooks_path ||= begin
        unless dry_run
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
        "s3://#{S3_BUCKET}/#{CHEF_KEY}/#{branch}.tar.gz"
      end
    end

    def cloudfront_config(app)
      AWS::CloudFront.distribution_config(
        app.downcase.to_sym,
        subdomain('origin'),
        app == 'Dashboard' ?
          [studio_subdomain] :
          [subdomain] + CDO.partners.map {|x| subdomain(nil, x)},
        {
          AcmCertificateArn: certificate_arn,
          MinimumProtocolVersion: 'TLSv1.2_2021',
          SslSupportMethod: 'sni-only'
        }
      )
    end

    # Fetch adhoc-specific tags prefixed with 'Op:' for preserving options
    private def read_existing_stack_op_tags
      client = Aws::CloudFormation::Client.new
      tags = client.describe_stacks(stack_name: stack_name).
                  stacks.first.tags
      tags.each_with_object({}) do |t, memo|
        next unless t.key.start_with?('Op:')
        raw_key = t.key.delete_prefix('Op:')
        # Convert 'CdnEnabled' -> 'cdn_enabled', others like 'Database' -> 'database'
        snake = raw_key.gsub(/([a-z])([A-Z])/, '\1_\2').downcase.to_sym
        memo[snake] = t.value.to_s.match?(/\A(true|1)\z/i)
      end
    rescue Aws::CloudFormation::Errors::ValidationError
      {}
    end

    private def get_binding
      binding
    end

    # Persist (or Re-persist) "Op:" tags based on final option values before rendering
    private def persist_op_tags
      # Remove any existing "Op:" tags
      tags.reject! {|t| t[:key].start_with?('Op:')}
      # Add or Re-add fresh values
      tags.push(key: 'Op:Database', value: options.database.to_s)
      tags.push(key: 'Op:Frontends', value: options.frontends.to_s)
      tags.push(key: 'Op:CdnEnabled', value: options.cdn_enabled.to_s)
      tags.push(key: 'Op:Alarms', value: options.alarms.to_s)
    end
  end
end
