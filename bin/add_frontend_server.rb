#!/usr/bin/env ruby
#
# Script for deploying an new Amazon EC2 frontend instance.
# For details usage instructions, please see:
# http://wiki.code.org/display/PROD/How+to+add+a+new+Frontend+server

require 'aws-sdk'
require_relative '../deployment'
require 'etc'
require 'net/ssh'
require 'net/scp'
require 'io/console'
require 'json'
require 'set'
require 'thread'

# A map from a supported environment to the corresponding Chef role to use for
# that environment.
ROLE_MAP = {
  'production' => 'front-end',
  'adhoc' => 'unmonitored-standalone',
}

# Wait no longer than 10 minutes for instance creation. Typically this takes a
# couple minutes.
MAX_WAIT_TIME = 600

# Define a mutext to keep output blocks from different threads from getting too jumbled.
OUTPUT_MUTEX = Mutex.new

class InstanceProvisioningInfo
  attr_accessor :name, :zone, :result, :public_dns, :private_dns

  def initialize(zone, name)
    @zone = zone
    @name = name
    @result = ''
    @public_dns = ''
    @private_dns = ''
  end
end

# Executes an arbitrary command on an ssh channel, prints the output to console,
# bails out if the command fails
# ssh: ssh channel from Net::SSH start
# command: Command to execute on the remote host
# exit_error_string: Error message to throw if the command exits with something other than 1
#
# Your invocation would look something like
# Net::SSH.start(hostname, username) do |ssh|
#   execute_ssh_on_channel(ssh, 'what to do', 'oh no something happened')
# end
def execute_ssh_on_channel(ssh, command, exit_error_string)
  ssh.open_channel do |channel|
    channel.exec(command) do |ch|
      ch.on_data do |_, data|
        $stdout.print data
      end

      ch.on_extended_data do |_, _, data|
        $stderr.print data
      end

      ch.on_request 'exit-status' do |_, data|
        if data.read_long != 0
          throw exit_error_string
        end
      end
    end
  end
  ssh.loop
end

# Return the AWS instance type to use for the given role.
def aws_instance_type(environment)
  case environment
  when 'adhoc'
    'c3.xlarge'  # Default to a somewhat smaller instance type for adhco
  when 'production'
    'c3.8xlarge'
  else
    raise "Unknown environment #{environment} - currently adhoc and production are supported"
  end
end

# Determine how the frontends are distributed across the zones
def determine_frontend_instance_distribution
  instances = @ec2client.describe_instances

  frontend_instances = instances.reservations.map do |reservation|
    reservation.instances.select do |instance|
      instance.state.name == 'running' &&
        instance.tags.detect { |tag| tag.key == 'Name' && tag.value.include?('frontend') }
    end
  end

  frontend_instances.flatten!

  instance_distribution = frontend_instances.each_with_object(Hash.new(0)) { |(instance, _), instance_distribution|
    instance_distribution[instance.placement.availability_zone] += 1
  }

  instance_distribution
end

# Return an array of objects that have the names and zones of instances to create
#
# When we are creating multiple frontends, don't bother trying to distribute in the underscaled instances. Just
# distribute them across all of our existing zones
def create_instance_provisioning_infos
  instances_to_provision_array = []
  instance_distribution = determine_frontend_instance_distribution
  instances_to_provision = @options['count']

  instances_to_provision_for_zones = Hash.new()

  instance_distribution.keys.each do |zone|
    instances_to_provision_for_zones[zone] = (instances_to_provision / instance_distribution.keys.count)
  end

  leftover_instances = instances_to_provision % instance_distribution.keys.count

  instance_distribution.keys.each do |zone|
    break if leftover_instances == 0
    instances_to_provision_for_zones[zone] += 1
    leftover_instances -= 1
  end

  puts instances_to_provision_for_zones

  instances_to_provision_for_zones.each do |zone, count|
    count.times do |new_instances|
      new_instance_name = determine_unique_name_for_instance_zone(@username, nil, zone, new_instances + instance_distribution[zone])
      instances_to_provision_array << InstanceProvisioningInfo.new(zone, new_instance_name)
    end
  end

  instances_to_provision_array
end

# Get a unique name for the instance zone. Make sure there isn't already a chief client or node with this name
def determine_unique_name_for_instance_zone(ssh_username, frontend_name, determined_instance_zone, instance_count)
  puts "Using instance zone #{determined_instance_zone} which has #{instance_count} instances"
  # There may be multiple instances of this script running at once or
  # stale clients or nodes in Chef, so try a few different instance indices to
  # find a unique one.

  Net::SSH.start('gateway.code.org', ssh_username) do |ssh|
    retry_index = 0
    while retry_index < 50
      if frontend_name
        name = "#{frontend_name}#{retry_index == 0 ? '' : retry_index.to_s}"
      else
        name = "frontend-#{@options['prefix'] ? @options['prefix'] + '-' : ''}#{determined_instance_zone[-1, 1] +
            (instance_count + 1 + retry_index).to_s}"
      end

      # Collect the names of all of the AWS instances.
      aws_instance_names = Set.new do |names|
        c.describe_instances.reservations.each do |r|
          r.instances.each { |i| i.tags.each { |tag| names << tag.value if tag.key == 'Name' }}
        end
      end

      # Match sure there are not hits against Chef node or client names.
      is_duplicate = aws_instance_names.include?(name) ||
          ssh.exec!("knife node list | egrep \'^#{name}$\'") ||
          ssh.exec!("knife client list | egrep \'^#{name}$\'")
      if is_duplicate
        print "Name #{name} is already in use, trying new index.\n"
        sleep(rand(4))  # Back off a random amount.
      else
        return name
      end
      retry_index += 1
    end
  end

  raise 'Unable to find unique instance name'
end

# Returns a (instance_zone, frontend_name) typle for the given  ec2client.  The instance_zone is the one with least
# capacity amongst frontend instances, and the frontend_name is one that is (probably) not currently already a known
# name to Chef,  except in infrequent race conditions.

# param {string} ssh_username: The ssh username to use for connecting to the gateway.
# param {frontend_name}: The base frontend name, or nil to use an automatically generated name.
# (If the base name is not unique, a unique suffix will be added to it to provide uniqueness)
def generate_instance_zone_and_name(ec2client, ssh_username, frontend_name = nil)
  instance_distribution = determine_frontend_instance_distribution
  determined_instance_zone, instance_count = instance_distribution.min_by{|_, v| v}
  return determined_instance_zone, determine_unique_name_for_instance_zone(ssh_username, frontend_name,
                                                                           determined_instance_zone, instance_count)
end

# Generate and provision a new instance. This will call AWS, create the instance, name it, update the chef configuration
# files, and bootstrap the new frontend. It will do everything up to, but not including running sudo chef-client
# on the production host.

# param {string} environment Which chef environment to update
# param {InstanceProvisioningInfo} instance_provisioning_info Contains the name and zone to update
# param {string} role
# param {string} instance_type
def generate_instance(environment, instance_provisioning_info, role, instance_type)
  print "Generating instance named #{instance_provisioning_info.name} in zone #{instance_provisioning_info.zone}\n"

  run_instance_response = @ec2client.run_instances ({
                                                      dry_run: @options['dry_run'] || false,
                                                      key_name: 'server_access_key',
                                                      min_count: 1,
                                                      max_count: 1,
                                                      image_id: 'ami-d05e75b8',  #Image ID for ubuntu instance we use
                                                      instance_type: instance_type,
                                                      monitoring: {
                                                          enabled: true
                                                      },
                                                      # Prevent api termination, except for adhoc instances.
                                                      disable_api_termination: (environment != 'adhoc'),
                                                      placement: {
                                                          availability_zone: instance_provisioning_info.zone
                                                      },
                                                      block_device_mappings: [
                                                          {
                                                              device_name: '/dev/sda1',
                                                              ebs: {
                                                                  volume_size: 128,
                                                                  delete_on_termination: true,
                                                                  volume_type: 'gp2',
                                                              },
                                                          },
                                                      ],
                                                      security_groups: ['pegasus'],
                                                  })

  instance_id = run_instance_response.instances[0].instance_id

  print "Looking for instance id #{instance_id}\n"

  started_at = Time.now
  @ec2client.wait_until(:instance_running, instance_ids: [instance_id]) do |waiting|
    waiting.max_attempts = nil

    waiting.before_wait do |_attempts, _response|
      if Time.now - started_at > MAX_WAIT_TIME
        puts "Instance #{instance_id} still not created. Giving up - check the EC2 console and see if there's an error."
        exit(1)
      end
    end
  end

  print "Instance #{instance_id} is now running, waiting for status checks to complete\n"

  started_at = Time.now

  @ec2client.wait_until(:instance_status_ok, instance_ids: [instance_id]) do |waiting|
    waiting.max_attempts = nil

    waiting.before_wait do |_attempts, _response|
      if Time.now - started_at > MAX_WAIT_TIME
        print "Instance #{instance_id} was created but has not passed status checks. Check EC2 console.\n"
        exit(1)
      end
    end
  end

  print "Instance #{instance_id} is healthy - adding to list of frontends for environment #{environment}\n"

  #Tag the instance with a name.
  @ec2client.create_tags({
                            resources: [instance_id],
                            tags: [
                                {
                                    key: 'Name',
                                    value: instance_provisioning_info.name,
                                },
                            ],
                        })

  instance_info = @ec2client.describe_instances({instance_ids: [instance_id],}).reservations[0].instances[0]
  private_dns_name = instance_info.private_dns_name
  public_dns_name = instance_info.public_dns_name
  instance_provisioning_info.private_dns = private_dns_name
  instance_provisioning_info.public_dns = public_dns_name

  OUTPUT_MUTEX.synchronize {
    print "\nCreated instance #{instance_id} with name #{instance_provisioning_info.name}\n"
    print "Private dns name: #{private_dns_name}\n\n"
    puts "Writing new configuration file\n"
  }

  file_suffix = rand(100_000_000)

  Net::SSH.start('gateway.code.org', @username) do |ssh|
    ssh.exec!("knife environment show #{environment} -F json > /tmp/old_knife_config#{file_suffix}")
  end

  Net::SCP.download!('gateway.code.org', @username, "/tmp/old_knife_config#{file_suffix}",
                     "/tmp/knife_config#{file_suffix}")

  OUTPUT_MUTEX.synchronize {
    configuration_json = JSON.parse(File.read("/tmp/knife_config#{file_suffix}"))
    configuration_json['override_attributes']['cdo-secrets']['app_servers'] ||= {}
    configuration_json['override_attributes']['cdo-secrets']['app_servers'][instance_provisioning_info.name] = private_dns_name
    File.open('/tmp/new_knife_config.json', 'w') do |f|
      f.write(JSON.dump(configuration_json))
    end
  }

  Net::SCP.upload!('gateway.code.org', @username, '/tmp/new_knife_config.json', "/tmp/new_knife_config#{file_suffix}.json")
  print "New configuration file uploaded, now loading it.\n"

  Net::SSH.start('gateway.code.org', @username) do |ssh|
    execute_ssh_on_channel(ssh,
                           "knife environment from file /tmp/new_knife_config#{file_suffix}.json",
                           "Unable to update environment #{environment}")
    ssh.exec!("rm /tmp/*#{file_suffix}*")
  end

  cmd = "ssh gateway.code.org -t \"/bin/sh -c 'knife bootstrap #{private_dns_name} -x ubuntu --sudo -E #{environment} -N #{instance_provisioning_info.name} -r role[#{role}]'\""
  print "Bootstrapping #{environment} frontend, please be patient. This takes ~15 minutes.\n"
  print cmd + "\n"
  bootstrap_result = `#{cmd}`

  if $?.success?
    print "Precompiling dashboard assets and upgrading.\n"
    precompile_cmd = "cd #{environment}/dashboard; bundle exec rake assets:precompile; sudo service dashboard upgrade"
    ssh_cmd = "ssh gateway.code.org -t \"ssh #{private_dns_name} -t '#{precompile_cmd}'\""
    print ssh_cmd + "\n"
    precompile_result = `#{ssh_cmd}`
    if $?.success?
      OUTPUT_MUTEX.synchronize {
        print "\n--------------------------------------------------------\n"
        print "Dashboard listening at: http://#{public_dns_name}:8080\n"
        print "Pegasus listening at:   http://#{public_dns_name}:8081\n"
        print "To ssh to server:       ssh gateway.code.org -t ssh #{private_dns_name}\n"
      }
    else
      print "Error precompiling assets\n"
      print precompile_result + "\n"
    end
  else
    print "Error bootstrapping server\n"
    print bootstrap_result + "\n"
  end
end

@options = {}

OptionParser.new do |opts|
  opts.on('-e', '--environment ENVIRONMENT', 'Environment to add frontend to') do |env|
    @options['environment'] = env
  end

  opts.on('-n', '--name NAME', 'Name for newly added frontend instance') do |name|
    @options['name'] = name
  end

  opts.on('-p', '--name-prefix PREFIX', 'Prefix for frontend names') do |prefix|
    @options['prefix'] = prefix
  end

  opts.on('-c', '--servers-to-create COUNT', 'Number of servers to create') do |count|
    @options['count'] = count.to_i
  end

  opts.on('-d', '--dry-run', 'Perform a dry run - don\'t actually create anything') do
    @options['dry_run'] = true
  end

  opts.on('-r', '--role ROLE', 'Role for new instance, overrides environment default') do |role|
    @options['role'] = role
  end

  opts.on('-h', '--help', 'Print this') do
    puts opts
    exit
  end

  opts.on('-u', '--username-override USERNAME', 'Username to log into gateway with') do |username|
    @options['username'] = username
  end
end.parse!

environment = @options['environment']
raise OptionParser::MissingArgument, 'Environment is required' if environment.nil?

raise OptionParser::MissingArgument, 'Name is required when creating one new instance' if @options['count'].nil? &&
  @options['name'].nil?

raise OptionParser::MissingArgument, 'Prefix is required when creating multiple instances' if !@options['count'].nil? &&
  @options['prefix'].nil?

role = @options['role'] || ROLE_MAP[environment]
raise "Unsupported environment #{environment}" unless role

puts "Creating new #{environment} instance using role #{role}"

@username = @options['username'] || Etc.getlogin

@options['count'] ||= 1
@options['prefix'] ||= ''

puts "Logging into gateway with username #{@username}"

Net::SSH.start('gateway.code.org', @username) do |ssh|
  puts ssh.exec!('echo "Verifying connection to gateway"')
end
puts @options

@ec2client = Aws::EC2::Client.new

instance_type = aws_instance_type(environment)
instances_to_create = []

if (@options['count'] == 1)
  determined_instance_zone, instance_name = generate_instance_zone_and_name(@ec2client, @username, @options['name'])

  puts "Naming instance #{instance_name}, creating frontend server with instance type #{instance_type}"
  instances_to_create << InstanceProvisioningInfo.new(determined_instance_zone, instance_name)
else
  instances_to_create = create_instance_provisioning_infos
end

instance_creation_threads = []

instances_to_create.each do |instance_to_create|
  instance_creation_threads << Thread.new do
    begin
      generate_instance(environment, instance_to_create, role, instance_type)
      instance_to_create.result = 'Succeeded'
    rescue Aws::EC2::Errors::DryRunOperation
      print "Instance creation of #{instance_to_create.name} would have succeeded but dry-run was set to true\n"
      instance_to_create.result = 'Dry-run succeeded'
    rescue Exception => e
      print "Some other exception happened when creating #{instance_to_create.name}\n"
      print e.inspect + "\n"
      instance_to_create.result = "Failed: #{e}"
    end
  end
  sleep(1)
end

instance_creation_threads.each(&:join)

instances_to_create.each do |instance_to_create|
  puts "#{instance_to_create.name}: #{instance_to_create.result}"
end

#If we've created all instances successfully, and without exceptions, it's safe to update the production daemon.
if instances_to_create.index {|created_instance| created_instance.result != 'Succeeded'}.nil?
  puts 'All instances were created successfully'
  puts 'Updating production-daemon chef config with new node.'
  `ssh gateway.code.org -t "ssh production-daemon -t sudo chef-client"`
  puts 'Done'
else
  puts 'Not proceeding with production daemon updating'
end
