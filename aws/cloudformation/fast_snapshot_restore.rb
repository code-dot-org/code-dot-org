require 'aws-sdk-ec2'
require 'json'
require_relative './cfn_response'

def handler(event:, context:)
  physical_resource_id = event['PhysicalResourceId']
  properties = event['ResourceProperties']
  case event['RequestType']
  when 'Create'
    physical_resource_id = create(properties)
  when 'Update'
    delete(physical_resource_id)
    physical_resource_id = create(properties)
  when 'Delete'
    delete(physical_resource_id)
    physical_resource_id = nil
  else
    raise 'Unsupported type'
  end
  CfnResponse.send(event, context, 'SUCCESS', physical_resource_id: physical_resource_id)
rescue => e
  CfnResponse.send(event, context, 'FAILURE', message: e.message)
end

EC2 = Aws::EC2::Client.new

def create(properties)
  azs = properties['AvailabilityZones']
  raise 'Invalid AvailabilityZones' if azs.empty? || azs.length > 10
  image_ids = properties['ImageIds']
  raise 'Invalid ImageIds' if image_ids.empty? || image_ids.length > 10
  snapshots = EC2.
    describe_images(image_ids: image_ids).
    images.
    map {|image| image.block_device_mappings[0].ebs.snapshot_id}
  raise 'No snapshots found' if snapshots.empty?
  resp = EC2.enable_fast_snapshot_restores(
    availability_zones: azs,
    source_snapshot_ids: snapshots
  )
  successful = resp.successful
  unsuccessful = resp.unsuccessful
  puts "Successful: #{successful}" unless successful.empty?
  puts "Unsuccessful: #{unsuccessful}" unless unsuccessful.empty?
  [azs, snapshots].to_json
end

def delete(physical_resource_id)
  azs, snapshots = JSON.parse(physical_resource_id)
  EC2.disable_fast_snapshot_restores(
    availability_zones: azs,
    source_snapshot_ids: snapshots
  )
rescue => e
  puts "Ignoring error on delete: #{e}"
end
