#!/usr/bin/env ruby
require 'optparse'
require 'fileutils'
require 'open3'
require 'erb'
require 'json'

# Load the MarketingSites::Configuration module
require_relative '../config'

options = {
  region: 'us-east-1',
  account_stack_name: 'marketing-sites-global-resources',
  account_template_file: 'account-resources.yml.erb',
  region_stack_name: 'marketing-sites-region-resources',
  region_template_file: 'region-resources.yml.erb',
  # https://github.blog/changelog/2022-01-13-github-actions-update-on-oidc-based-deployments-to-aws/
  github_intermediate_cert_thumbprints: '6938fd4d98bab03faadb97b34396831e3780aea1,1c58a3a8518e8759bf075b76b750d4f2df264fcd'
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
    '--role-arn ARN',
    String,
    "IAM Role ARN to use for CloudFormation stack creation/updates",
    "Format: arn:aws:iam::<account-id>:role/<role-name>",
    "(Optional - if not provided, uses default AWS credentials)"
  ) do |arn|
    options[:role_arn] = arn
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

  opts.on('-h', '--help', 'Show this help message') do
    puts opts
    puts "\nExamples:"
    puts "  # Setup Marketing Sites Global Resources in the current AWS Account and Region Resources in the default region (us-east-1)"
    puts "  ./setup.rb"
    puts ""
    puts "  # Setup Marketing Sites Global Resources in the current AWS Account and Region Resources in in a specific region (us-west-2)"
    puts "  ./setup.rb --region us-west-2"
    exit
  end
end

def execute_command(command, description)
  puts "#{description}..."
  stdout, stderr, status = Open3.capture3(command)

  if status.success?
    puts "Success: #{description}"
    puts stdout unless stdout.empty?
    return stdout
  else
    puts "Error: #{description} failed"
    puts stderr
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

    puts "Template processed successfully: #{output_path}"
    return output_path
  rescue => exception
    puts "Exception processing template: #{exception.message}"
    exit 1
  end
end

def deploy_stack(stack_name:, template_file:, parameters: {}, region:, role_arn: nil, tags: {}, capabilities: [])
  temp_dir = File.join(Dir.pwd, 'tmp')
  FileUtils.mkdir_p(temp_dir)
  parameter_path = nil  # Initialize to nil

  # Build the AWS CLI command
  command_parts = [
    "aws cloudformation deploy",
    "--stack-name #{stack_name}",
    "--template-file #{template_file}",
    "--region #{region}"
  ]

  # Add capabilities if any are specified
  unless capabilities.empty?
    command_parts << "--capabilities #{capabilities.join(' ')}"
  end

  command_parts << "--role-arn #{role_arn}" if role_arn

  # Add parameters if any
  unless parameters.empty?
    param_file = "parameters_#{stack_name}_#{Time.now.to_i}.json"
    parameter_path = File.join(temp_dir, param_file)
    parameter_content = parameters.map {|k, v| {"ParameterKey" => k, "ParameterValue" => v.to_s}}
    File.write(parameter_path, JSON.pretty_generate(parameter_content))
    command_parts << "--parameter-overrides file://#{parameter_path}"
  end

  # Add tags only if there are any
  unless tags.empty?
    tag_string = tags.map {|k, v| "#{k}=#{v}"}.join(" ")
    command_parts << "--tags #{tag_string}"
  end

  command = command_parts.join(" \\\n    ")

  begin
    execute_command(command, "Deploying stack '#{stack_name}' in region '#{region}'")
  ensure
    # Clean up the parameter file if it was created
    if parameter_path && File.exist?(parameter_path)
      FileUtils.rm_f(parameter_path)
    end
  end
end

def get_stack_outputs(stack_name, region)
  command = <<~CMD
    aws cloudformation describe-stacks \\
        --stack-name #{stack_name} \\
        --region #{region} \\
        --query "Stacks[0].Outputs" \\
        --output json
  CMD

  output = execute_command(command, "Getting outputs from stack '#{stack_name}'")

  # Handle case where output might be nil or empty
  return [] if output.nil? || output.strip.empty?

  begin
    parsed_output = JSON.parse(output.strip)
    # Handle case where Outputs is null in CloudFormation
    return [] if parsed_output.nil?
    return parsed_output
  rescue JSON::ParserError => exception
    puts "Warning: Could not parse stack outputs as JSON: #{exception.message}"
    puts "Raw output: #{output}"
    return []
  end
end

def validate_template(template_file, region)
  command = <<~CMD
    aws cloudformation validate-template \\
        --template-body file://#{template_file} \\
        --region #{region}
  CMD

  execute_command(command, "Validating CloudFormation template")
end

def deploy_account_resources(options)
  puts "\n🏢 === Deploying Global Resources (Once per AWS Account) in #{options[:region]} ==="

  puts "\n=== Step 1: Processing Account-Level Template ==="
  processed_template_path = process_template(
    options[:account_template_file],
    "account_template_#{Time.now.to_i}.yml",
    binding
  )

  puts "\n=== Step 2: Validating Account-Level Template ==="
  validate_template(processed_template_path, options[:region])

  puts "\n=== Step 3: Deploying Account-Level Stack in US East 1 ==="
  parameters = {
    "GitHubIntermediateCertificateThumbprintList" => options[:github_intermediate_cert_thumbprints]
  }

  # For account resources
  deploy_stack(
    stack_name: options[:account_stack_name],
    template_file: processed_template_path,
    parameters: parameters,
    region: options[:region],
    role_arn: options[:role_arn],
    capabilities: ["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"]
  )

  puts "\n=== Step 4: Account-Level Deployment Results ==="
  begin
    outputs = get_stack_outputs(options[:account_stack_name], options[:region])

    if outputs.empty?
      puts "No outputs found for account-level stack."
    else
      puts "\nAccount-Level Stack Outputs:"
      outputs.each do |output|
        puts "  #{output['OutputKey']}: #{output['OutputValue']}"
        puts "    Description: #{output['Description']}" if output['Description']
      end
    end
  rescue => exception
    puts "Warning: Could not retrieve account-level stack outputs: #{exception.message}"
  end
end

def deploy_region_resources(options)
  puts "\n🌐 === Deploying Region-Level Resources (Region: #{options[:region]}) ==="

  puts "\n=== Step 1: Processing Region-Level Template ==="
  processed_template_path = process_template(
    options[:region_template_file],
    "region_template_#{Time.now.to_i}.yml",
    binding
  )

  puts "\n=== Step 2: Validating Region-Level Template ==="
  validate_template(processed_template_path, options[:region])

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
    role_arn: options[:role_arn]
  )

  puts "\n=== Step 4: Region-Level Deployment Results ==="
  begin
    outputs = get_stack_outputs(options[:region_stack_name], options[:region])

    if outputs.empty?
      puts "No outputs found for region-level stack."
    else
      puts "\nRegion-Level Stack Outputs:"
      outputs.each do |output|
        puts "  #{output['OutputKey']}: #{output['OutputValue']}"
        puts "    Description: #{output['Description']}" if output['Description']
      end

      # Show which AZs were used
      az_output = outputs.find {|o| o['OutputKey'] == 'AvailabilityZones'}
      if az_output
        puts "\n✓ Infrastructure deployed across Availability Zones: #{az_output['OutputValue']}"
      else
        # Fallback to showing configured AZs if output not found
        region_config = MarketingSites::Configuration::REGIONS[options[:region].to_sym]
        selected_azs = region_config[:selected_availability_zones]
        puts "\n✓ Infrastructure deployed across Availability Zones: #{selected_azs.join(', ')}"
      end
    end
  rescue => exception
    puts "Warning: Could not retrieve region-level stack outputs: #{exception.message}"
  end
end

begin
  opt_parser.parse!

  missing_params = []
  missing_params << "region" unless options[:region]

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
