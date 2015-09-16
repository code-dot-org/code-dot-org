require 'aws-sdk'
require_relative '../deployment'

MAX_WAIT_TIME = 600 #Wait no longer than 10 minutes for instance creation. Typically this takes a couple minutes

Aws.config.update({
                      region: CDO.aws_region,
                      credentials: Aws::Credentials.new(CDO.aws_access_key, CDO.aws_secret_key),
                  })

ec2client = Aws::EC2::Client.new

instances = ec2client.describe_instances

#Determine distribution of availability zones, pick the one that has the least capacity among frontend instances
instance_distribution = Hash.new(0)

instances.reservations.each do |reservation|
  reservation.instances.each do |instance|
    unless instance.state.name == 'running'
      next
    end

    is_frontend = true

    instance.tags.each do |tag|
      if tag.key == 'Name' and not tag.value.include? 'frontend'
        is_frontend = false
        break
      end
    end

    unless is_frontend
      next
    end

    availability_zone = instance.placement.availability_zone
    if instance_distribution.has_key?(availability_zone)
      instance_distribution[availability_zone] += 1
    else
      instance_distribution[availability_zone] = 1
    end
  end
end

puts "Current availability zone distribution #{instance_distribution}"

determined_instance_zone = instance_distribution.select { |_, v| v == instance_distribution.values.min }.keys[0]

puts "Using underscaled instance zone #{determined_instance_zone}"

instance_name = 'frontend-' + determined_instance_zone[-1, 1] + (instance_distribution[determined_instance_zone] + 1).to_s
puts "Naming instance #{instance_name}"

run_instance_response = ec2client.run_instances ({
                                                    dry_run: false,
                                                    min_count: 1,
                                                    max_count: 1,
                                                    image_id: 'ami-d05e75b8',  #Image ID for ubuntu instance we use
                                                    instance_type: 'c3.8xlarge',
                                                    monitoring: {
                                                        enabled:true
                                                    },
                                                    disable_api_termination: true, #Prevent against accidental termination
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
puts "Looking for instance id  #{instance_id}"
time_waited = 0

while time_waited < MAX_WAIT_TIME
  time_waited += 5
  sleep(5)
  puts 'Checking for instance creation'
  instance_status_response = ec2client.describe_instance_status({instance_ids:[instance_id]})

  unless instance_status_response.instance_statuses.empty?
    instance_state = instance_status_response.instance_statuses[0].instance_state.name
    puts "Instance ID #{instance_id} is now #{instance_state}"
    if instance_state == 'running'
      break
    end
  end
end

unless instance_state == 'running'
  puts "Unable to create instance after waiting #{time_waited} seconds"
  exit(1)
end

#Tag the instance with a name
ec2client.create_tags({
                          resources: [instance_id],
                          tags: [
                              {
                                  key: 'Name',
                                  value: instance_name,
                              },
                          ],
                      })

puts "Created instance #{instance_id}"

private_dns_name = ec2client.describe_instances({instance_ids: [instance_id],}).reservations[0].instances[0].private_dns_name

puts "Private DNS name #{private_dns_name}"