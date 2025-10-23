#!/usr/bin/env ruby
require 'optparse'
require 'fileutils'
require 'erb'
require 'json'
require 'aws-sdk-cloudformation'
require 'aws-sdk-s3'
require 'aws-sdk-sts'

# Load the MarketingSites::Configuration module
require_relative '../config'

options = {
  region: 'us-east-1',
  account_stack_name: 'marketing-sites-global-resources',
  account_template_file: 'account-resources.yml.erb',
  region_stack_name: 'marketing-sites-region-resources',
  region_template_file: 'region-resources.yml.erb',
  # https://github.blog/changelog/2022-01-13-github-actions-update-on-oidc-based-deployments-to-aws/
  github_intermediate_cert_thumbprints: '6938fd4d98bab03faadb97b34396831e3780aea1,1c58a3a8518e8759bf075b76b750d4f2df264fcd',
  template_s3_bucket: nil # Required
}

opt_parser = OptionParser.new do |opts|
  opts.banner = "Usage: ./setup.rb [options]"

  opts.on(
    '--region REGION',
    String,
    "AWS Region to provision region-specific resources",
    "Default: us-east-1"
  ) do |region|
    options[:region] = region
  end

  opts.on(
    '--account-stack-name NAME',
    String,
    "Name of the account-level resources CloudFormation stack",
    "Default: marketing-sites-global-resources"
  ) do |name|
    options[:account_stack_name] = name
  end

  opts.on(
    '--region-stack-name NAME',
    String,
    "Name of the region-level resources CloudFormation stack",
    "Default: marketing-sites-region-resources"
  ) do |name|
    options[:region_stack_name] = name
  end

  opts.on(
    '--github-thumbprints THUMBPRINTS',
    String,
    "Comma-separated list of GitHub intermediate certificate thumbprints",
    "Default: 6938fd4d98bab03faadb97b34396831e3780aea1,1c58a3a8518e8759bf075b76b750d4f2df264fcd"
  ) do |thumbprints|
    options[:github_intermediate_cert_thumbprints] = thumbprints
  end

  opts.on(
    '--cloudformation-role-arn ARN',
    String,
    "IAM Role ARN that CloudFormation should use to create/update Stacks",
    "Format: arn:aws:iam::<account-id>:role/<role-name>",
    "(Optional - if not provided, uses default AWS credentials)"
  ) do |arn|
    options[:cloudformation_role_arn] = arn
  end

  opts.on(
    '--account-template-file FILE',
    String,
    "Path to the account-level resources CloudFormation template file",
    "Default: account-resources.yml.erb"
  ) do |file|
    options[:account_template_file] = file
  end

  opts.on(
    '--region-template-file FILE',
    String,
    "Path to the region-level resources CloudFormation template file",
    "Default: region-resources.yml.erb"
  ) do |file|
    options[:region_template_file] = file
  end

  opts.on(
    '--template-bucket BUCKET',
    String,
    "S3 bucket name for storing CloudFormation templates (REQUIRED)"
  ) do |bucket|
    options[:template_s3_bucket] = bucket
  end

  opts.on('-h', '--help', 'Show this help message') do
    puts opts
    puts "\nExamples:"
    puts "  # Setup Marketing Sites Global Resources in the current AWS Account and Region Resources in the default region (us-east-1)"
    puts "  ./setup.rb --template-bucket cf-templates-1a2b3c4d5e6f-us-east-1"
    puts ""
    puts "  # Setup Marketing Sites Global Resources in the current AWS Account and Region Resources in in a specific region (us-west-2)"
    puts "  # Fine to keep it simple and always place templates in a bucket that's in us-east-1"
    puts "  ./setup.rb --region us-west-2 --template-bucket cf-templates-1a2b3c4d5e6f-us-east-1"
    exit
  end
end

# Initialize AWS clients
def get_aws_clients(region)
  config = {region: region}
  {
    s3: Aws::S3::Client.new(config),
    cloudformation: Aws::CloudFormation::Client.new(config),
    sts: Aws::STS::Client.new(config)
  }
end

def upload_template_to_s3(template_file, bucket_name, s3_client)
  file_size = File.size(template_file)
  timestamp = Time.now.strftime("%Y%m%d-%H%M%S")
  stack_name = File.basename(template_file, ".*")
  s3_key = "marketing-sites-templates/#{stack_name}-#{timestamp}.yml"

  puts "Uploading template to S3 (#{file_size} bytes): s3://#{bucket_name}/#{s3_key}"

  begin
    s3_client.put_object(
      bucket: bucket_name,
      key: s3_key,
      body: File.read(template_file),
      content_type: 'application/x-yaml'
    )

    # Return the S3 URL
    s3_url = "https://#{bucket_name}.s3.#{s3_client.config.region}.amazonaws.com/#{s3_key}"
    puts "Success: Template uploaded to #{s3_url}"
    return s3_url
  rescue Aws::S3::Errors::ServiceError => exception
    puts "Error uploading template to S3: #{exception.message}"
    exit 1
  end
end

def process_template(template_file, output_file, binding_object)
  unless File.exist?(template_file)
    puts "Error: Template file '#{template_file}' does not exist"
    exit 1
  end

  temp_dir = File.join(Dir.pwd, 'tmp')
  FileUtils.mkdir_p(temp_dir)
  output_path = File.join(temp_dir, output_file)
  template_content = File.read(template_file)

  # Process the ERB template using Ruby's ERB library
  # This allows us to use the current binding to access local variables
  begin
    renderer = ERB.new(template_content, trim_mode: '-')
    result = renderer.result(binding_object)
    File.write(output_path, result)

    file_size = File.size(output_path)
    puts "Template processed successfully: #{output_path} (#{file_size} bytes)"
    return output_path
  rescue => exception
    puts "Exception processing template: #{exception.message}"
    exit 1
  end
end

def stack_exists?(stack_name, cloudformation_client)
  response = cloudformation_client.describe_stacks(stack_name: stack_name)
  stack = response.stacks.first
  # Check if stack exists and is not in a deleted state
  return stack && !['DELETE_COMPLETE'].include?(stack.stack_status)
rescue Aws::CloudFormation::Errors::ValidationError => exception
  # Stack doesn't exist
  return false if exception.message.include?('does not exist')
  raise exception
rescue Aws::CloudFormation::Errors::ServiceError => exception
  puts "Error checking stack existence: #{exception.message}"
  return false
end

def deploy_stack(stack_name:, template_file:, parameters: {}, region:, cloudformation_role_arn: nil, tags: {}, capabilities: [], template_s3_bucket:, clients:)
  s3_client = clients[:s3]
  cf_client = clients[:cloudformation]

  # Always upload template to S3
  template_url = upload_template_to_s3(template_file, template_s3_bucket, s3_client)

  # Check if stack exists to determine create vs update
  stack_exists = stack_exists?(stack_name, cf_client)
  operation = stack_exists ? :update : :create

  puts "Stack #{stack_exists ? 'exists' : 'does not exist'}, using #{operation}_stack"

  # Prepare parameters for CloudFormation
  cf_parameters = parameters.map {|k, v| {parameter_key: k, parameter_value: v.to_s}}
  cf_tags = tags.map {|k, v| {key: k, value: v.to_s}}

  # Build the CloudFormation request
  request_params = {
    stack_name: stack_name,
    template_url: template_url,
    parameters: cf_parameters,
    tags: cf_tags,
    capabilities: capabilities,
    role_arn: cloudformation_role_arn
  }.compact # Remove optional parameters like `role_arn` if not provided.

  begin
    if operation == :create
      puts "Creating stack '#{stack_name}' in region '#{region}'"
      cf_client.create_stack(request_params)
    else
      puts "Updating stack '#{stack_name}' in region '#{region}'"
      cf_client.update_stack(request_params)
    end

    # Wait for stack operation to complete
    wait_for_stack_completion(stack_name, operation, cf_client)
  rescue Aws::CloudFormation::Errors::ValidationError => exception
    if exception.message.include?('No updates are to be performed')
      puts "No changes detected for stack '#{stack_name}'"
      return
    else
      puts "CloudFormation validation error: #{exception.message}"
      exit 1
    end
  rescue Aws::CloudFormation::Errors::ServiceError => exception
    puts "CloudFormation service error: #{exception.message}"
    exit 1
  end
end

def wait_for_stack_completion(stack_name, operation, cf_client)
  puts "Waiting for stack #{operation} to complete..."

  begin
    if operation == :create
      cf_client.wait_until(:stack_create_complete, stack_name: stack_name) do |w|
        w.max_attempts = 120  # 120 * 30 seconds = 1 hour max wait time
        w.delay = 30          # Check every 30 seconds
      end
    else
      cf_client.wait_until(:stack_update_complete, stack_name: stack_name) do |w|
        w.max_attempts = 120  # 120 * 30 seconds = 1 hour max wait time
        w.delay = 30          # Check every 30 seconds
      end
    end
    puts "Success: Stack #{operation} completed"
  rescue Aws::Waiters::Errors::WaiterFailed => exception
    puts "Error: Stack #{operation} failed or timed out: #{exception.message}"

    # Get the stack events to help with debugging
    begin
      puts "\nRecent stack events:"
      events = cf_client.describe_stack_events(stack_name: stack_name).stack_events
      events.first(10).each do |event|
        puts "  #{event.timestamp} - #{event.logical_resource_id} - #{event.resource_status} - #{event.resource_status_reason}"
      end
    rescue => event_error
      puts "Could not retrieve stack events: #{event_error.message}"
    end

    exit 1
  end
end

def get_stack_outputs(stack_name, cf_client)
  response = cf_client.describe_stacks(stack_name: stack_name)
  stack = response.stacks.first

  return [] unless stack&.outputs

  # Convert to hash format similar to CLI output
  stack.outputs.map do |output|
    {
      'OutputKey' => output.output_key,
      'OutputValue' => output.output_value,
      'Description' => output.description
    }
  end
rescue Aws::CloudFormation::Errors::ServiceError => exception
  puts "Warning: Could not retrieve stack outputs: #{exception.message}"
  return []
end

def print_stack_outputs(stack_name, cf_client, region = nil)
  outputs = get_stack_outputs(stack_name, cf_client)

  if outputs.empty?
    puts "No outputs found for #{stack_name} stack."
    return
  end

  puts "\n#{stack_name.tr('-', ' ').split.map(&:capitalize).join(' ')} Stack Outputs:"
  outputs.each do |output|
    puts "  #{output['OutputKey']}: #{output['OutputValue']}"
    puts "    Description: #{output['Description']}" if output['Description']
  end
rescue => exception
  puts "Warning: Could not retrieve stack outputs: #{exception.message}"
end

def validate_template(template_file, template_s3_bucket, clients)
  s3_client = clients[:s3]
  cf_client = clients[:cloudformation]

  # Upload to S3 and validate via URL
  template_url = upload_template_to_s3(template_file, template_s3_bucket, s3_client)

  begin
    puts "Validating CloudFormation template..."
    response = cf_client.validate_template(template_url: template_url)
    puts "Success: Template validation passed"

    # Optionally show template details
    if response.parameters && !response.parameters.empty?
      puts "Template parameters: #{response.parameters.map(&:parameter_key).join(', ')}"
    end
  rescue Aws::CloudFormation::Errors::ValidationError => exception
    puts "Template validation failed: #{exception.message}"
    exit 1
  rescue Aws::CloudFormation::Errors::ServiceError => exception
    puts "Error validating template: #{exception.message}"
    exit 1
  end
end

def deploy_account_resources(options)
  puts "\n🏢 === Deploying Global Resources (Once per AWS Account) in #{options[:region]} ==="

  # Initialize AWS clients for us-east-1 (global resources always go there).
  clients = get_aws_clients('us-east-1')

  puts "\n=== Step 1: Processing Account-Level Template ==="
  processed_template_path = process_template(
    options[:account_template_file],
    "account_template_#{Time.now.to_i}.yml",
    binding
  )

  puts "\n=== Step 2: Validating Account-Level Template ==="
  validate_template(processed_template_path, options[:template_s3_bucket], clients)

  puts "\n=== Step 3: Deploying Account-Level Stack in US East 1 ==="
  parameters = {
    "GitHubIntermediateCertificateThumbprintList" => options[:github_intermediate_cert_thumbprints]
  }

  # For account resources
  deploy_stack(
    stack_name: options[:account_stack_name],
    template_file: processed_template_path,
    parameters: parameters,
    region: 'us-east-1',
    cloudformation_role_arn: options[:cloudformation_role_arn],
    capabilities: ["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"],
    template_s3_bucket: options[:template_s3_bucket],
    clients: clients
  )

  puts "\n=== Step 4: Account-Level Deployment Results ==="
  print_stack_outputs(options[:account_stack_name], clients[:cloudformation])
end

def deploy_region_resources(options)
  puts "\n🌐 === Deploying Region-Level Resources (Region: #{options[:region]}) ==="

  # Initialize AWS clients for the specified region
  clients = get_aws_clients(options[:region])

  puts "\n=== Step 1: Processing Region-Level Template ==="
  processed_template_path = process_template(
    options[:region_template_file],
    "region_template_#{Time.now.to_i}.yml",
    binding
  )

  puts "\n=== Step 2: Validating Region-Level Template ==="
  validate_template(processed_template_path, options[:template_s3_bucket], clients)

  puts "\n=== Step 3: Deploying Region-Level Stack ==="
  parameters = {}

  # Add other parameters as needed
  if options[:hosted_zone_id]
    parameters["HostedZoneId"] = options[:hosted_zone_id]
  end

  if options[:base_domain_name]
    parameters["BaseDomainName"] = options[:base_domain_name]
  end

  # For region resources
  deploy_stack(
    stack_name: options[:region_stack_name],
    template_file: processed_template_path,
    parameters: parameters,
    region: options[:region],
    cloudformation_role_arn: options[:cloudformation_role_arn],
    template_s3_bucket: options[:template_s3_bucket],
    clients: clients
  )

  puts "\n=== Step 4: Region-Level Deployment Results ==="
  print_stack_outputs(options[:region_stack_name], clients[:cloudformation], options[:region])
end

begin
  opt_parser.parse!

  missing_params = []
  missing_params << "region" unless options[:region]
  missing_params << "template-bucket" unless options[:template_s3_bucket]

  unless missing_params.empty?
    puts "Error: Missing required parameters: #{missing_params.join(', ')}"
    puts opt_parser
    exit 1
  end

  puts "Deployment configuration:"
  options.each do |key, value|
    next if value.nil?
    puts "  #{key}: #{value}"
  end

  puts "\nThis will deploy both account-level and region-level infrastructure resources."
  puts "Do you want to continue? [y/N]: "
  confirmation = $stdin.gets.chomp.downcase

  if ['y', 'yes'].include?(confirmation)
    begin
      deploy_account_resources(options.merge(region: 'us-east-1')) # Always deploy Global resources to US East 1
    rescue => exception
      puts "❌ Account-level resources deployment failed: #{exception.message}"
      puts "Backtrace: #{exception.backtrace.first(5).join("\n")}"
      exit 1
    end

    begin
      deploy_region_resources(options)
      puts "\n🎉 === Setup Account-level & Region-level resources Complete ==="
    rescue => exception
      puts "❌ Region-level resources deployment failed: #{exception.message}"
      puts "Exception class: #{exception.class}"
      puts "Backtrace:"
      puts exception.backtrace.first(10)  # Show first 10 lines of backtrace
      exit 1
    end
  else
    puts "Deployment cancelled."
    exit 0
  end
rescue OptionParser::InvalidOption, OptionParser::MissingArgument, OptionParser::InvalidArgument => exception
  puts "Error: #{exception.message}"
  puts opt_parser
  exit 1
rescue Interrupt
  puts "\nDeployment interrupted by user."
  exit 1
rescue => exception
  puts "Unexpected error: #{exception.message}"
  puts "Backtrace:"
  puts exception.backtrace
  exit 1
end
