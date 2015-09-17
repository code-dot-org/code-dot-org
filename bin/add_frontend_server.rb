require 'aws-sdk'
require_relative '../deployment'

MAX_WAIT_TIME = 600 #Wait no longer than 10 minutes for instance creation. Typically this takes a couple minutes

ec2client = Aws::EC2::Client.new

instances = ec2client.describe_instances

#Determine distribution of availability zones, pick the one that has the least capacity among frontend instances
frontend_instances = []

instances.reservations.each do |reservation|
  frontends_for_reservation = reservation.instances.select{|instance| instance.tags.detect{|tag| tag.key == 'Name' && tag.value.include?('frontend')}}
  frontend_instances << frontends_for_reservation unless frontends_for_reservation.size == 0
end

instance_distribution = frontend_instances.each_with_object(Hash.new(0)){|(instance, _), instance_distribution| instance_distribution[instance.placement.availability_zone] += 1}

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
                                                        enabled: true
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

started_at = Time.now
ec2client.wait_until(:instance_running, instance_ids: [instance_id]) do |waiting|
  if Time.now - started_at > MAX_WAIT_TIME
    puts "Instance #{instance_id} still not created. Giving up - check the EC2 console and see if there's an error."
    exit(1);
  end
end

puts "Instance #{instance_id} is now running"

started_at = Time.now

ec2client.wait_until(:instance_status_ok, instance_ids: [instance_id]) do |waiting|
  if Time.now - started_at > MAX_WAIT_TIME
    puts "Instance #{instance_id} was created but has not passed status checks. Giving up - check the EC2 console and see if there's an error."
    exit(1);
  end
end

puts "Instance #{instance_id} is okay and can be added to load balancers"


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
