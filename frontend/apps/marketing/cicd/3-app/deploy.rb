#!/usr/bin/env ruby
require 'optparse'
require 'fileutils'
require 'open3'
require 'erb'
require 'json'

# Load the MarketingSites::Configuration module
require_relative '../config'

# Hard-coded template paths
MARKETING_SITE_TEMPLATE_FILE = 'template.yml.erb'
CERTIFICATE_TEMPLATE_FILE = 'cloudfront-certificate.yml.erb'

# Default options
options = {
  environment_type: 'development',
  site_type: 'corporate',
  region: 'us-east-1',
  base_domain_name: 'marketing-sites.dev-code.org',
  subdomain_name: 'code',
  production_domain_name: nil,
  production_hosted_zone_id: nil,
  # TODO: populate Account ID dynamically.
  # role_arn: "arn:aws:iam::${account_id}:role/admin/CloudFormationMarketingSitesDevelopmentRole"
  role_arn: nil,
  cloudformation_role_boundary: nil
}

opt_parser = OptionParser.new do |opts|
  opts.banner = "Usage: ./deploy.rb [options]"

  opts.on(
    '--environment_type ENVIRONMENT_TYPE',
    %w[development test production],
    "Environment type (development, test, or production)",
    "Default: development"
  ) do |environment_type|
    options[:environment_type] = environment_type
  end

  opts.on(
    '--site_type SITE_TYPE',
    %w[corporate csforall],
    "Code identifying the site type (corporate csforall)",
    ) do |site_type|
    options[:site_type] = site_type
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
    '--production_domain_name DOMAIN',
    "Fully qualified production domain name for this site",
    "(e.g. 'hourofcode.org' for production deployments)",
    "Only used when environment_type is 'production'"
  ) do |domain|
    # To simplify the bash logic, GitHub Actions always attempts to send this argument, even when the GitHub Environment
    # `PRODUCTION_DOMAIN_NAME` does not exist or is empty. OptionsParser with String type interprets an empty string
    # value as an invalid argument, so we remove the String type constraint and set this to `nil` when the supplied
    # argument was an empty string.
    options[:production_domain_name] = (domain.nil? || domain.empty?) ? nil : domain
  end

  opts.on(
    '--production_hosted_zone_id ID',
    "AWS Route 53 Hosted Zone ID for the production domain",
    "Required when production_domain_name is specified"
  ) do |id|
    # To simplify the bash logic, GitHub Actions always attempts to send this argument, even when the GitHub Environment
    # Secret `PRODUCTION_HOSTED_ZONE_ID` does not exist or is empty. OptionsParser with String type interprets an empty
    # string value as an invalid argument, so we remove the String type constraint and set this to `nil` when the
    # supplied argument was an empty string.
    options[:production_hosted_zone_id] = (id.nil? || id.empty?) ? nil : id
  end

  opts.on(
    '--container_image_hash HASH',
    String,
    "The sha256sum of the marketing sites Next.js container image"
  ) do |hash|
    options[:container_image_hash] = hash
  end

  opts.on(
    '--web_application_server_secrets_arn ARN',
    String,
    "AWS Secrets Manager ARN containing web application server secrets",
    "Format: arn:aws:secretsmanager:<region>:<account-id>:secret:<secret-name>"
  ) do |arn|
    options[:web_application_server_secrets_arn] = arn
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
    '--role_arn ARN',
    String,
    "IAM Role ARN to use for CloudFormation stack creation/updates",
    "Format: arn:aws:iam::<account-id>:role/<role-name>"
  ) do |arn|
    options[:role_arn] = arn
  end

  opts.on(
    '--cloudformation_role_boundary ARN',
    String,
    "The IAM Policy that any Role created by this template must apply as a Permissions Boundary.",
    "Format: arn:aws:iam::<account-id>:policy/<policy-name>"
  ) do |arn|
    options[:cloudformation_role_boundary] = arn
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
  # This allows us to use the current binding to access local variables
  begin
    renderer = ERB.new(template_content, trim_mode: '-')
    result = renderer.result(binding_object)

    # Write the processed template to the output file
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
  parameter_path = nil

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
    # Clean up the parameter file if the parameter_path was set and the file exists
    if parameter_path && File.exist?(parameter_path)
      FileUtils.rm_f(parameter_path)
    end
  end
end

def get_stack_output(stack_name, output_key, region)
  command = <<~CMD
    aws cloudformation describe-stacks \\
        --stack-name #{stack_name} \\
        --region #{region} \\
        --query "Stacks[0].Outputs[?OutputKey=='#{output_key}'].OutputValue" \\
        --output text
  CMD

  execute_command(command, "Getting '#{output_key}' from stack '#{stack_name}'").strip
end

def validate_production_domain_options(options)
  is_production = options[:environment_type] == 'production'
  has_production_domain = options[:production_domain_name] && !options[:production_domain_name].empty?
  has_production_hosted_zone = options[:production_hosted_zone_id] && !options[:production_hosted_zone_id].empty?

  # If production domain is specified, hosted zone must be specified too
  if has_production_domain && !has_production_hosted_zone
    puts "Error: production_hosted_zone_id is required when production_domain_name is specified"
    exit 1
  end

  # If production hosted zone is specified, domain must be specified too
  if has_production_hosted_zone && !has_production_domain
    puts "Error: production_domain_name is required when production_hosted_zone_id is specified"
    exit 1
  end

  # Warn if production domain options are specified but environment is not production
  if !is_production && (has_production_domain || has_production_hosted_zone)
    puts "Warning: Production domain options are specified but environment_type is '#{options[:environment_type]}'"
    puts "Production domain will only be configured when environment_type is 'production'"
  end
end

begin
  opt_parser.parse!

  missing_params = []
  missing_params << "hosted_zone_id" unless options[:hosted_zone_id]
  missing_params << "container_image_hash" unless options[:container_image_hash]
  missing_params << "web_application_server_secrets_arn" unless options[:web_application_server_secrets_arn]
  missing_params << "role_arn" unless options[:role_arn]
  missing_params << "cloudformation_role_boundary" unless options[:cloudformation_role_boundary]

  unless missing_params.empty?
    puts "Error: Missing required parameters: #{missing_params.join(', ')}"
    puts opt_parser
    exit 1
  end

  # Validate production domain options
  validate_production_domain_options(options)

  if options[:stack_name].nil?
    # Create fully qualified domain name
    fully_qualified_domain_name = "#{options[:subdomain_name]}.#{options[:base_domain_name]}"
    # Replace periods with hyphens for CloudFormation compatibility
    options[:stack_name] = fully_qualified_domain_name.tr('.', '-')
    puts "Auto-generated stack name: #{options[:stack_name]}"
  end

  puts "Deployment configuration:"
  puts "  Marketing Site Template: #{MARKETING_SITE_TEMPLATE_FILE}"
  puts "  Certificate Template: #{CERTIFICATE_TEMPLATE_FILE}"
  options.each do |key, value|
    # Only show production domain options if they have values
    production_domain_options = [:production_domain_name, :production_hosted_zone_id]
    next if production_domain_options.include?(key) && value.nil?
    puts "  #{key}: #{value}"
  end

  # Show production domain configuration status
  is_production = options[:environment_type] == 'production'
  has_production_domain = options[:production_domain_name] && !options[:production_domain_name].empty?
  has_production_hosted_zone = options[:production_hosted_zone_id] && !options[:production_hosted_zone_id].empty?
  enable_production_domain = is_production && has_production_domain && has_production_hosted_zone

  if ENV['CI'] == 'true'
    puts "Running in CI mode. Skipping confirmation..."
    confirmation = 'yes'
  else
    puts "\nDo you want to continue? [y/N]: "
    confirmation = $stdin.gets.chomp.downcase
  end

  if ['y', 'yes'].include?(confirmation)
    # Generate certificate stack name
    fully_qualified_domain_name = "#{options[:subdomain_name]}.#{options[:base_domain_name]}"
    cert_stack_name = "#{fully_qualified_domain_name.tr('.', '-')}-certificate"

    # Step 1: Process certificate template.
    puts "\n=== Step 1: Processing Certificate Template ==="
    cert_template_path = process_template(
      CERTIFICATE_TEMPLATE_FILE,
      "certificate_template_#{Time.now.to_i}.yml",
      binding
    )

    # Step 2: Deploy certificate stack in us-east-1 (always).
    puts "\n=== Step 2: Deploying Certificate Stack in us-east-1 ==="
    cert_parameters = {
      "HostedZoneId" => options[:hosted_zone_id],
      "BaseDomainName" => options[:base_domain_name],
      "SubdomainName" => options[:subdomain_name]
    }.tap do |params|
      if enable_production_domain
        params["ProductionDomainName"] = options[:production_domain_name]
        params["ProductionHostedZoneId"] = options[:production_hosted_zone_id]
      end
    end

    deploy_stack(
      stack_name: cert_stack_name,
      template_file: cert_template_path,
      parameters: cert_parameters,
      region: 'us-east-1',
      role_arn: options[:role_arn],
      tags: {
        'environment-type' => options[:environment_type],
        'site-type' => options[:site_type]
      }
    )

    # Step 3: Get certificate ARN from stack output.
    puts "\n=== Step 3: Getting Certificate ARN ==="
    certificate_arn = get_stack_output(cert_stack_name, "CloudFrontTLSCertificateArn", "us-east-1")

    # Step 4: Process marketing site template.
    puts "\n=== Step 4: Processing Marketing Site Template ==="
    marketing_site_template_path = process_template(
      MARKETING_SITE_TEMPLATE_FILE,
      "marketing_site_template_#{Time.now.to_i}.yml",
      binding
    )

    # Step 5: Deploy marketing site stack.
    puts "\n=== Step 5: Deploying Marketing Site Stack in #{options[:region]} ==="
    marketing_site_stack_parameters = {
      "HostedZoneId" => options[:hosted_zone_id],
      "BaseDomainName" => options[:base_domain_name],
      "SubdomainName" => options[:subdomain_name],
      "EnvironmentType" => options[:environment_type],
      "SiteType" => options[:site_type],
      "ContainerImageHashDigest" => options[:container_image_hash],
      "CloudFrontTLSCertificateArn" => certificate_arn,
      "WebApplicationServerSecretsARN" => options[:web_application_server_secrets_arn],
      "RoleBoundary" => options[:cloudformation_role_boundary]
    }.tap do |params|
      if enable_production_domain
        params["ProductionDomainName"] = options[:production_domain_name]
        params["ProductionHostedZoneId"] = options[:production_hosted_zone_id]
      end
    end

    deploy_stack(
      stack_name: options[:stack_name],
      template_file: marketing_site_template_path,
      parameters: marketing_site_stack_parameters,
      region: options[:region],
      role_arn: options[:role_arn],
      tags: {
        'environment-type' => options[:environment_type],
        'site-type' => options[:site_type]
      },
      capabilities: %w(CAPABILITY_IAM CAPABILITY_NAMED_IAM) # Marketing Sites templates creates ECS Task / Task Exec Roles.
    )

    puts "\nDeployment process completed successfully!"
  else
    puts "Deployment cancelled."
    exit 0
  end
rescue OptionParser::InvalidOption, OptionParser::MissingArgument, OptionParser::InvalidArgument => exception
  puts "Error: #{exception.message}"
  puts opt_parser
  exit 1
end
