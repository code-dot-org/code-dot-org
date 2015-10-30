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

# A map from a supported environment to the corresponding Chef role to use for
# that environment.
ROLE_MAP = {
  'production' => 'front-end',
  'adhoc' => 'unmonitored-standalone',
}

# Wait no longer than 10 minutes for instance creation. Typically this takes a
# couple minutes.
MAX_WAIT_TIME = 600

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
    raise "Unknown environment #{environment}"
  end
end

# Returns a (instance_zone, frontend_name) typle for the given
# ec2client.  The instance_zone is the one with least capacity amongst frontend instances,
# and the frontend_name is one that is (probably) not currently already a known name to Chef,
# except in infrequent race conditions.

# param {string} ssh_username: The ssh username to use for connecting to the gateway.
# param {frontend_name}: The base frontend name, or nil to use an automatically generated name.
# (If the base name is not unique, a unique suffix will be added to it to provide uniqueness)
def generate_instance_zone_and_name(ec2client, ssh_username, frontend_name = nil)
  instances = ec2client.describe_instances

  #Determine distribution of availability zones, pick the one that has the least capacity among frontend instances
  frontend_instances = instances.reservations.map do |reservation|
    reservation.instances.select{|instance| instance.state.name == 'running' && instance.tags.detect{|tag| tag.key ==
                                                                                                     'Name' && tag.value.include?('frontend')}}
  end

  frontend_instances.flatten!

  instance_distribution = frontend_instances.each_with_object(Hash.new(0)){|(instance, _), instance_distribution|
    instance_distribution[instance.placement.availability_zone] += 1}
  determined_instance_zone, instance_count = instance_distribution.min_by{|_, v| v}

  puts "Using underscaled instance zone #{determined_instance_zone}"

  # There may be multiple instances of this script running at once or
  # stale clients or nodes in Chef, so try a few different instance indices to
  # find a unique one.
  Net::SSH.start('gateway.code.org', ssh_username) do |ssh|
    retry_index = 0
    while retry_index < 50
      if frontend_name
        name = "#{frontend_name}#{retry_index == 0 ? '' : retry_index.to_s}"
      else
        name = "frontend-#{determined_instance_zone[-1, 1] + (instance_count + 1 + retry_index).to_s}"
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
        puts "Name #{name} is already in use, trying new index."
        sleep(rand(4))  # Back off a random amount.
      else
        return determined_instance_zone, name
      end
      retry_index += 1
    end
  end

  raise "Unable to find unique instance name"
end

options = {}

OptionParser.new do |opts|
  opts.on('-e', '--environment ENVIRONMENT', 'Environment to add frontend to') do |env|
    options['environment'] = env
  end

  opts.on('-n', '--name NAME', 'Name for newly added frontend instance') do |name|
    options['name'] = name
  end

  opts.on('-r', '--role ROLE', 'Role for new instance, overrides environment default') do |role|
    options['role'] = role
  end

  opts.on('-h', '--help', 'Print this') { puts options; exit }

  opts.on('-u', '--username-override USERNAME', 'Username to log into gateway with') do |username|
    options['username'] = username
  end
end.parse!

environment = options['environment']
raise OptionParser::MissingArgument, 'Environment is required' if environment.nil?

role = options['role'] || ROLE_MAP[environment]
raise "Unsupported environment #{environment}" unless role

puts "Creating new #{environment} instance using role #{role}"

username = options['username'] || Etc.getlogin

puts "Logging into gateway with username #{username}"

Net::SSH.start('gateway.code.org', username) do |ssh|
  puts ssh.exec!('echo "Verifying connection to gateway"')
end

ec2client = Aws::EC2::Client.new

determined_instance_zone, instance_name = generate_instance_zone_and_name(ec2client, username, options['name'])
instance_type = aws_instance_type(environment)
puts "Naming instance #{instance_name}, creating frontend server with instance type #{instance_type}"

run_instance_response = ec2client.run_instances ({
                                                    dry_run: false,
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
                                                      availability_zone: determined_instance_zone
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

puts "Looking for instance id #{instance_id}"

started_at = Time.now
ec2client.wait_until(:instance_running, instance_ids: [instance_id]) do |waiting|
  waiting.max_attempts = nil

  waiting.before_wait do |attempts, response|
    if Time.now - started_at > MAX_WAIT_TIME
      puts "Instance #{instance_id} still not created. Giving up - check the EC2 console and see if there's an error."
      exit(1)
    end
  end
end

puts "Instance #{instance_id} is now running, waiting for status checks to complete"

started_at = Time.now

ec2client.wait_until(:instance_status_ok, instance_ids: [instance_id]) do |waiting|
  waiting.max_attempts = nil

  waiting.before_wait do |attempts, response|
    if Time.now - started_at > MAX_WAIT_TIME
      puts "Instance #{instance_id} was created but has not passed status checks. Check EC2 console."
      exit(1)
    end
  end
end

puts "Instance #{instance_id} is healthy - adding to list of frontends for environment #{environment}"

#Tag the instance with a name.
ec2client.create_tags({
                          resources: [instance_id],
                          tags: [
                              {
                                  key: 'Name',
                                  value: instance_name,
                              },
                          ],
                      })

instance_info = ec2client.describe_instances({instance_ids: [instance_id],}).reservations[0].instances[0]
private_dns_name = instance_info.private_dns_name
public_dns_name = instance_info.public_dns_name

puts
puts "Created instance #{instance_id} with name #{instance_name} "
puts "Private dns name: #{private_dns_name}"
puts
puts 'Writing new configuration file'

file_suffix = rand(100000000)

Net::SSH.start('gateway.code.org', username) do |ssh|
  ssh.exec!("knife environment show #{environment} -F json > /tmp/old_knife_config#{file_suffix}")
end

Net::SCP.download!('gateway.code.org', username, "/tmp/old_knife_config#{file_suffix}",
                   "/tmp/knife_config#{file_suffix}")

configuration_json = JSON.parse(File.read("/tmp/knife_config#{file_suffix}"))
configuration_json['override_attributes']['cdo-secrets']['app_servers'] ||= {}
configuration_json['override_attributes']['cdo-secrets']['app_servers'][instance_name] = private_dns_name

File.open('/tmp/new_knife_config.json', 'w') do |f|
  f.write(JSON.dump(configuration_json))
end

Net::SCP.upload!('gateway.code.org', username, '/tmp/new_knife_config.json', "/tmp/new_knife_config#{file_suffix}.json")
puts 'New configuration file uploaded, now loading it.'

Net::SSH.start('gateway.code.org', username) do |ssh|
  execute_ssh_on_channel(ssh,
                         "knife environment from file /tmp/new_knife_config#{file_suffix}.json",
                         "Unable to update environment #{environment}")
  ssh.exec!("rm /tmp/*#{file_suffix}*")
end

cmd = "ssh gateway.code.org -t \"/bin/sh -c 'knife bootstrap #{private_dns_name} -x ubuntu --sudo -E #{environment} -N #{instance_name} -r role[#{role}]'\""
puts "Bootstrapping #{environment} frontend, please be patient. This takes ~15 minutes."
puts cmd
bootstrap_result = `#{cmd}`

if $?.success?
  puts 'Precompiling dashboard assets and upgrading.'
  precompile_cmd = "cd #{environment}/dashboard; bundle exec rake assets:precompile; sudo service dashboard upgrade"
  ssh_cmd = "ssh gateway.code.org -t \"ssh #{private_dns_name} -t '#{precompile_cmd}'\""
  puts ssh_cmd
  precompile_result = `#{ssh_cmd}`
  if $?.success?
    puts
    puts '--------------------------------------------------------'
    puts "Dashboard listening at: http://#{public_dns_name}:8080"
    puts "Pegasus listening at:   http://#{public_dns_name}:8081"
    puts "To ssh to server:       ssh gateway.code.org -t ssh #{private_dns_name}"
    puts
    puts 'Updating production-daemon chef config with new node.'
    `ssh gateway -t "ssh production-daemon -t sudo chef-client"`
    puts "Done"
  else
    puts 'Error precompiling assets'
    puts precompile_result
  end
else
  puts 'Error bootstrapping server'
  puts bootstrap_result
end
