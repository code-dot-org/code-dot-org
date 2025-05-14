#!/usr/bin/env ruby
require 'optparse'
require 'aws-sdk-cloudformation'
require 'json'
require 'time'
require 'erb'

# Hard-coded template paths
MARKETING_SITE_TEMPLATE_FILE = '3-app/template.yml.erb'
CERTIFICATE_TEMPLATE_FILE = '3-app/cloudfront-certificate.yml.erb'

# Default options
options = {
  environment_type: 'development',
  region: 'us-east-1',
  base_domain_name: 'marketing-sites.dev-code.org',
  subdomain_name: 'code'
}

opt_parser = OptionParser.new do |opts|
  opts.banner = "Usage: ./deploy.rb [options]"

  opts.on(
    '--environment_type TYPE',
    %w[development test production],
    "Environment type (development, test, or production)",
    "Default: development"
  ) do |env_type|
    options[:environment_type] = env_type
  end

  opts.on(
    '--region REGION',
    String,
    "AWS Region to deploy this marketing site",
    "Default: us-east-1"
  ) do |region|
    options[:region] = region
  end

  opts.on(
    '--hosted_zone_id ID',
    String,
    "AWS Route 53 Hosted Zone ID to provision this marketing site's domain name",
    "(e.g. the Hosted Zone ID for 'marketing-sites.dev-code.org')"
  ) do |id|
    options[:hosted_zone_id] = id
  end

  opts.on(
    '--base_domain_name DOMAIN',
    String,
    "The base domain name of this marketing site",
    "(e.g. 'marketing-sites.test-code.org' in 'hourofcode.marketing-sites.test-code.org')",
    "Default: marketing-sites.dev-code.org"
  ) do |domain|
    options[:base_domain_name] = domain
  end

  opts.on(
    '--subdomain_name SUBDOMAIN',
    String,
    "Subdomain name of this marketing site",
    "(e.g. 'hourofcode' in 'hourofcode.marketing-sites.test-code.org')",
    "Default: code"
  ) do |subdomain|
    options[:subdomain_name] = subdomain
  end

  opts.on(
    '--container_image_hash HASH',
    String,
    "The sha256sum of the marketing sites Next.js container image"
  ) do |hash|
    options[:container_image_hash] = hash
  end

  opts.on(
    '--stack_name NAME',
    String,
    "Name of the CloudFormation stack to create or update",
    "(Default: derived from subdomain and base domain, with dots replaced by hyphens)"
  ) do |name|
    options[:stack_name] = name
  end

  opts.on(
    '--wait',
    "Wait for stack operation to complete"
  ) do
    options[:wait] = true
  end

  opts.on('-h', '--help', 'Show this help message') do
    puts opts
    exit
  end
end

def process_template(template_file, options)
  # Check if template file exists
  unless File.exist?(template_file)
    puts "Error: Template file '#{template_file}' does not exist"
    exit 1
  end

  # Process the ERB template with the options
  erb_template = ERB.new(File.read(template_file))
  erb_template.result(binding)
end

def deploy_cloudformation_stack(client, stack_name, template_body, parameters, wait = false)
  # Check if stack exists
  stack_exists = false
  begin
    client.describe_stacks(stack_name: stack_name)
    stack_exists = true
    puts "Stack '#{stack_name}' exists. Updating..."
  rescue Aws::CloudFormation::Errors::ValidationError
    puts "Stack '#{stack_name}' does not exist. Creating new stack..."
  end

  # Create or update stack
  begin
    if stack_exists
      response = client.update_stack(
        stack_name: stack_name,
        template_body: template_body,
        parameters: parameters,
        capabilities: %w[CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND]
      )
      puts "Stack update initiated. StackId: #{response.stack_id}"
    else
      response = client.create_stack(
        stack_name: stack_name,
        template_body: template_body,
        parameters: parameters,
        capabilities: %w[CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND],
        on_failure: 'ROLLBACK'
      )
      puts "Stack creation initiated. StackId: #{response.stack_id}"
    end

    # Wait for stack to complete if requested
    if wait
      wait_for_stack_operation(client, stack_name, stack_exists ? 'update' : 'create')
    end

    return response.stack_id
  rescue Aws::CloudFormation::Errors::ServiceError => exception
    puts "Error deploying CloudFormation stack: #{exception.message}"
    exit 1
  end
end

def wait_for_stack_operation(cf_client, stack_name, operation)
  puts "Waiting for stack #{operation} to complete..."

  waiter_name = operation == 'update' ? :stack_update_complete : :stack_create_complete

  begin
    cf_client.wait_until(waiter_name, stack_name: stack_name) do |w|
      # Configure the waiter
      w.max_attempts = 120  # Maximum number of polling attempts
      w.delay = 30          # Delay between polling attempts in seconds

      # Report progress
      w.before_wait do |attempts, _response|
        puts "Waiting for stack #{operation} to complete... (attempt #{attempts}/120)"

        # Print current stack events
        events = cf_client.describe_stack_events({stack_name: stack_name}).stack_events
        recent_events = events.first(5)

        puts "\nRecent stack events:"
        recent_events.each do |event|
          status = event.resource_status
          reason = event.resource_status_reason ? " - #{event.resource_status_reason}" : ""
          puts "  #{event.timestamp}: #{event.resource_type} (#{event.logical_resource_id}): #{status}#{reason}"
        end
        puts "\n"
      end
    end

    # Get the outputs from the stack
    stack = cf_client.describe_stacks(stack_name: stack_name).stacks.first

    puts "\nStack #{operation} completed successfully!"

    unless stack.outputs.empty?
      puts "\nStack Outputs:"
      stack.outputs.each do |output|
        puts "  #{output.output_key}: #{output.output_value}"
        puts "    #{output.description}" if output.description
      end
    end

    # Return stack outputs as a hash
    outputs = {}
    stack.outputs.each do |output|
      outputs[output.output_key] = output.output_value
    end
    return outputs
  rescue Aws::Waiters::Errors::WaiterFailed => exception
    puts "Error waiting for stack operation to complete: #{exception.message}"

    # Get the current stack status and reason
    begin
      stack = cf_client.describe_stacks(stack_name: stack_name).stacks.first
      puts "Stack status: #{stack.stack_status}"
      puts "Stack status reason: #{stack.stack_status_reason}" if stack.stack_status_reason
    rescue Aws::CloudFormation::Errors::ServiceError => e
      puts "Could not get stack status: #{e.message}"
    end

    exit 1
  end
end

def create_certificate_stack(options)
  # Always use us-east-1 for CloudFront certificates
  certificate_region = 'us-east-1'
  cert_cf_client = Aws::CloudFormation::Client.new(region: certificate_region)

  # Generate certificate stack name
  fqdn = "#{options[:subdomain_name]}.#{options[:base_domain_name]}"
  cert_stack_name = "#{fqdn.tr('.', '-')}-certificate"

  puts "Deploying CloudFront certificate stack in #{certificate_region}:"
  puts "  Stack name: #{cert_stack_name}"

  # Process the certificate template
  cert_template_body = process_template(CERTIFICATE_TEMPLATE_FILE, options)

  # Create parameters for certificate stack
  cert_parameters = [
    {
      parameter_key: 'HostedZoneId',
      parameter_value: options[:hosted_zone_id]
    },
    {
      parameter_key: 'BaseDomainName',
      parameter_value: options[:base_domain_name]
    },
    {
      parameter_key: 'SubdomainName',
      parameter_value: options[:subdomain_name]
    }
  ]

  # Deploy the certificate stack and wait for it to complete
  puts "Deploying certificate stack in #{certificate_region}..."
  deploy_cloudformation_stack(cert_cf_client, cert_stack_name, cert_template_body, cert_parameters, true)

  # Get the certificate ARN from the stack outputs
  begin
    cert_stack = cert_cf_client.describe_stacks(stack_name: cert_stack_name).stacks.first
    certificate_arn = nil

    cert_stack.outputs.each do |output|
      if output.output_key == 'CertificateArn'
        certificate_arn = output.output_value
        break
      end
    end

    if certificate_arn.nil?
      puts "Error: Could not find CertificateArn in certificate stack outputs"
      exit 1
    end

    puts "Certificate ARN: #{certificate_arn}"
    return certificate_arn
  rescue Aws::CloudFormation::Errors::ServiceError => exception
    puts "Error retrieving certificate stack outputs: #{exception.message}"
    exit 1
  end
end

def deploy_marketing_site_stack(options, certificate_arn)
  # Create CloudFormation client for the marketing site region
  cf_client = Aws::CloudFormation::Client.new(region: options[:region])

  # Process marketing site template
  marketing_site_template_body = process_template(MARKETING_SITE_TEMPLATE_FILE, options)

  # Map options to CloudFormation parameters
  parameters = [
    {
      parameter_key: 'HostedZoneId',
      parameter_value: options[:hosted_zone_id]
    },
    {
      parameter_key: 'BaseDomainName',
      parameter_value: options[:base_domain_name]
    },
    {
      parameter_key: 'SubdomainName',
      parameter_value: options[:subdomain_name]
    },
    {
      parameter_key: 'EnvironmentType',
      parameter_value: options[:environment_type]
    },
    {
      parameter_key: 'ContainerImageHashDigest',
      parameter_value: options[:container_image_hash]
    },
    {
      parameter_key: 'CertificateArn',
      parameter_value: certificate_arn
    }
  ]

  # Deploy the marketing site stack
  puts "Deploying marketing site stack in #{options[:region]}..."
  deploy_cloudformation_stack(cf_client, options[:stack_name], marketing_site_template_body, parameters, options[:wait])
end

begin
  opt_parser.parse!

  # Check for required parameters
  missing_params = []
  missing_params << "hosted_zone_id" unless options[:hosted_zone_id]
  missing_params << "container_image_hash" unless options[:container_image_hash]

  unless missing_params.empty?
    puts "Error: Missing required parameters: #{missing_params.join(', ')}"
    puts opt_parser
    exit 1
  end

  # Check if template files exist
  unless File.exist?(MARKETING_SITE_TEMPLATE_FILE)
    puts "Error: Marketing Site template file '#{MARKETING_SITE_TEMPLATE_FILE}' does not exist"
    exit 1
  end

  unless File.exist?(CERTIFICATE_TEMPLATE_FILE)
    puts "Error: Certificate template file '#{CERTIFICATE_TEMPLATE_FILE}' does not exist"
    exit 1
  end

  # Generate default stack name if not provided
  if options[:stack_name].nil?
    # Create fully qualified domain name
    fqdn = "#{options[:subdomain_name]}.#{options[:base_domain_name]}"
    # Replace periods with hyphens for CloudFormation compatibility
    options[:stack_name] = fqdn.tr('.', '-')
    puts "Auto-generated stack name: #{options[:stack_name]}"
  end

  # Display configuration
  puts "Deployment configuration:"
  puts "  Marketing Site Template: #{MARKETING_SITE_TEMPLATE_FILE}"
  puts "  Certificate Template: #{CERTIFICATE_TEMPLATE_FILE}"
  options.each do |key, value|
    puts "  #{key}: #{value}"
  end

  # Confirm deployment
  print "\nDo you want to continue? [y/N]: "
  confirmation = $stdin.gets.chomp.downcase

  if ['y', 'yes'].include?(confirmation)
    # First deploy certificate stack in us-east-1
    puts "\n=== Step 1: Deploying CloudFront Certificate Stack in us-east-1 ==="
    certificate_arn = create_certificate_stack(options)

    # Then deploy marketing site stack in target region
    puts "\n=== Step 2: Deploying Marketing Site Stack in #{options[:region]} ==="
    deploy_marketing_site_stack(options, certificate_arn)

    puts "\nDeployment process completed."
  else
    puts "Deployment cancelled."
    exit 0
  end
rescue OptionParser::InvalidOption, OptionParser::MissingArgument, OptionParser::InvalidArgument => exception
  puts "Error: #{exception.message}"
  puts opt_parser
  exit 1
end
