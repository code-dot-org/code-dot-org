require 'aws-sdk-ec2'
require 'json'
require 'securerandom'
require_relative './cfn_response'

def handler(event:, context:)
  physical_resource_id = event['PhysicalResourceId']
  physical_resource_id ||= SecureRandom.uuid
  properties = event['ResourceProperties']
  case event['RequestType']
  when 'Create'
    create(properties)
  when 'Update'
    delete(event['OldResourceProperties'])
    create(properties)
  when 'Delete'
    delete(properties)
  else
    raise 'Unsupported type'
  end
  CfnResponse.send(event, context, 'SUCCESS', physical_resource_id: physical_resource_id)
rescue => e
  CfnResponse.send(event, context, 'FAILURE', message: e.message)
end

EC2 = Aws::EC2::Client.new

def find(properties)
  azs = properties['AvailabilityZones']
  raise 'Invalid AvailabilityZones' if azs.empty? || azs.length > 10
  image_ids = properties['ImageIds']
  raise 'Invalid ImageIds' if image_ids.empty? || image_ids.length > 10
  snapshots = EC2.
    describe_images(image_ids: image_ids).
    images.
    map {|image| image.block_device_mappings[0].ebs.snapshot_id}
  raise 'No snapshots found' if snapshots.empty?
  [azs, snapshots]
end

def create(properties)
  azs, snapshots = find(properties)
  resp = EC2.enable_fast_snapshot_restores(
    availability_zones: azs,
    source_snapshot_ids: snapshots
  )
  successful = resp.successful
  unsuccessful = resp.unsuccessful
  puts "Successful: #{successful}" unless successful.empty?
  puts "Unsuccessful: #{unsuccessful}" unless unsuccessful.empty?
end

def delete(properties)
  azs, snapshots = find(properties)
  EC2.disable_fast_snapshot_restores(
    availability_zones: azs,
    source_snapshot_ids: snapshots
  )
rescue => e
  puts "Ignoring error on delete: #{e}"
end
