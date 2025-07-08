#!/usr/bin/env ruby
require 'optparse'
require 'fileutils'
require 'open3'
require 'erb'
require 'json'

# Hard-coded template path
GLOBAL_TEMPLATE_FILE = 'per-account.yml.erb'

# Default options
options = {
  region: 'us-east-1',
  stack_name: 'marketing-sites-global-resources',
  # https://github.blog/changelog/2022-01-13-github-actions-update-on-oidc-based-deployments-to-aws/
  github_intermediate_cert_thumbprints: '6938fd4d98bab03faadb97b34396831e3780aea1,1c58a3a8518e8759bf075b76b750d4f2df264fcd'
}

opt_parser = OptionParser.new do |opts|
  opts.banner = "Usage: ./deploy.rb [options]"

  opts.on(
    '--region REGION',
    String,
    "AWS Region to deploy the global resources stack",
    "Default: us-east-1"
  ) do |region|
    options[:region] = region
  end

  opts.on(
    '--stack_name NAME',
    String,
    "Name of the CloudFormation stack to create or update",
    "Default: marketing-sites-global-resources"
  ) do |name|
    options[:stack_name] = name
  end

  opts.on(
    '--github_thumbprints THUMBPRINTS',
    String,
    "Comma-separated list of GitHub intermediate certificate thumbprints",
    "Default: 6938fd4d98bab03faadb97b34396831e3780aea1,1c58a3a8518e8759bf075b76b750d4f2df264fcd"
  ) do |thumbprints|
    options[:github_intermediate_cert_thumbprints] = thumbprints
  end

  opts.on(
    '--role_arn ARN',
    String,
    "IAM Role ARN to use for CloudFormation stack creation/updates",
    "Format: arn:aws:iam::<account-id>:role/<role-name>",
    "(Optional - if not provided, uses default AWS credentials)"
  ) do |arn|
    options[:role_arn] = arn
  end

  opts.on(
    '--template_file FILE',
    String,
    "Path to the CloudFormation template file",
    "Default: per-account.yml.erb"
  ) do |file|
    options[:template_file] = file
  end

  opts.on('-h', '--help', 'Show this help message') do
    puts opts
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
  # Verify template exists
  unless File.exist?(template_file)
    puts "Error: Template file '#{template_file}' does not exist"
    exit 1
  end

  # Create temp dir if it doesn't exist
  temp_dir = File.join(Dir.pwd, 'tmp')
  FileUtils.mkdir_p(temp_dir)

  # Generate temp file path
  output_path = File.join(temp_dir, output_file)

  # Read the template file
  template_content = File.read(template_file)

  # Process the ERB template using Ruby's ERB library
  begin
    renderer = ERB.new(template_content, trim_mode: '-')
    result = renderer.result(binding_object)

    # Write the processed template to the output file
    File.write(output_path, result)

    puts "Template processed successfully: #{output_path}"
    return output_path
  rescue => exception
    puts "Exception processing template: #{exception.message}"
    puts "Backtrace:"
    puts exception.backtrace
    exit 1
  end
end

def deploy_stack(stack_name, template_file, parameters, region, role_arn = nil)
  temp_dir = File.join(Dir.pwd, 'tmp')
  FileUtils.mkdir_p(temp_dir)

  # Build the AWS CLI command
  command_parts = [
    "aws cloudformation deploy",
    "--stack-name #{stack_name}",
    "--template-file #{template_file}",
    "--capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND",
    "--region #{region}"
  ]

  # Add role ARN if provided
  command_parts << "--role-arn #{role_arn}" if role_arn

  # Add parameters if any
  unless parameters.empty?
    param_file = "parameters_#{stack_name}_#{Time.now.to_i}.json"
    parameter_path = File.join(temp_dir, param_file)
    parameter_content = parameters.map {|k, v| {"ParameterKey" => k, "ParameterValue" => v.to_s}}
    File.write(parameter_path, JSON.pretty_generate(parameter_content))
    command_parts << "--parameter-overrides file://#{parameter_path}"
  end

  # Add tags
  command_parts << "--tags purpose=marketing-sites-global-resources"

  command = command_parts.join(" \\\n    ")

  begin
    execute_command(command, "Deploying global resources stack '#{stack_name}' in region '#{region}'")
  ensure
    # Clean up the parameter file if it was created
    if defined?(parameter_path) && File.exist?(parameter_path)
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
  JSON.parse(output)
end

def validate_template(template_file, region)
  command = <<~CMD
    aws cloudformation validate-template \\
        --template-body file://#{template_file} \\
        --region #{region}
  CMD

  execute_command(command, "Validating CloudFormation template")
end

begin
  opt_parser.parse!

  # Set template file if provided via option
  template_file = options[:template_file] || GLOBAL_TEMPLATE_FILE

  puts "Global Resources Deployment Configuration:"
  puts "  Template File: #{template_file}"
  options.each do |key, value|
    next if key == :template_file  # Already displayed above
    puts "  #{key}: #{value}"
  end

  # Ask for confirmation unless in CI
  if ENV['CI'] == 'true'
    puts "Running in CI mode. Skipping confirmation..."
    confirmation = 'yes'
  else
    puts "\nThis will deploy global IAM resources for marketing sites."
    puts "Do you want to continue? [y/N]: "
    confirmation = $stdin.gets.chomp.downcase
  end

  if ['y', 'yes'].include?(confirmation)
    # Step 1: Process the ERB template
    puts "\n=== Step 1: Processing Global Resources Template ==="
    processed_template_path = process_template(
      template_file,
      "global_resources_template_#{Time.now.to_i}.yml",
      binding
    )

    # Step 2: Validate the template
    puts "\n=== Step 2: Validating CloudFormation Template ==="
    validate_template(processed_template_path, options[:region])

    # Step 3: Deploy the stack
    puts "\n=== Step 3: Deploying Global Resources Stack ==="
    parameters = {
      "GitHubIntermediateCertificateThumbprintList" => options[:github_intermediate_cert_thumbprints]
    }

    deploy_stack(
      options[:stack_name],
      processed_template_path,
      parameters,
      options[:region],
      options[:role_arn]
    )

    # Step 4: Display stack outputs
    puts "\n=== Step 4: Deployment Results ==="
    begin
      outputs = get_stack_outputs(options[:stack_name], options[:region])

      puts "\nStack Outputs:"
      outputs.each do |output|
        puts "  #{output['OutputKey']}: #{output['OutputValue']}"
        puts "    Description: #{output['Description']}" if output['Description']
      end

      puts "\n=== Deployment Summary ==="
      puts "✅ Global resources deployed successfully!"
      puts "📋 Stack Name: #{options[:stack_name]}"
      puts "🌍 Region: #{options[:region]}"
      puts "\nYou can now use the output values above when deploying individual marketing site stacks."
    rescue => exception
      puts "Warning: Could not retrieve stack outputs: #{exception.message}"
      puts "Stack deployment completed, but output retrieval failed."
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
