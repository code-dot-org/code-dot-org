require_relative '../../../shared/test/test_helper'

VCR.turn_off!
Aws.config[:stub_responses] = true

require_relative '../fast_snapshot_restore'
require 'ostruct'
require 'webmock/minitest'

class TestFastSnapshotRestore < Minitest::Test
  def setup
    EC2.stub_responses(
      :describe_images, {
        images: [{
          block_device_mappings: [
            ebs: {snapshot_id: 'snap'}
          ]
        }]
      }
    )
    EC2.api_requests.clear
  end

  def handle(request_type, physical_resource_id, properties = {}, old_properties: nil)
    response_url = 'http://example.com/response'
    stub_request(:put, response_url)
    handler(
      event: {
        'RequestType' => request_type,
        'ResponseURL' => response_url,
        'PhysicalResourceId' => physical_resource_id,
        'ResourceProperties' => properties,
        'OldResourceProperties' => old_properties
      },
      context: OpenStruct.new(log_stream_name: 'log')
    )
  end

  def expect_api(*requests)
    assert_equal requests.map(&:first).map {|(op, params)| {operation_name: op, params: params}},
      EC2.api_requests.map {|req| req.slice(:operation_name, :params)}
  end

  def test_create
    handle 'Create', nil, {'AvailabilityZones' => ['az'], 'ImageIds' => ['ami']}
    expect_api(
      {describe_images: {image_ids: ['ami']}},
      {enable_fast_snapshot_restores: {availability_zones: ['az'], source_snapshot_ids: ['snap']}}
    )
  end

  def test_update
    handle 'Update', '12345', {'AvailabilityZones' => ['az'], 'ImageIds' => ['ami2']},
      old_properties: {'AvailabilityZones' => ['az'], 'ImageIds' => ['oldAmi']}
    expect_api(
      {describe_images: {image_ids: ['oldAmi']}},
      {disable_fast_snapshot_restores: {availability_zones: ['az'], source_snapshot_ids: ['snap']}},
      {describe_images: {image_ids: ['ami2']}},
      {enable_fast_snapshot_restores: {availability_zones: ['az'], source_snapshot_ids: ['snap']}}
    )
  end

  def test_delete
    handle 'Delete', '12345', {'AvailabilityZones' => ['az'], 'ImageIds' => ['ami']}
    expect_api(
      {describe_images: {image_ids: ['ami']}},
      {disable_fast_snapshot_restores: {availability_zones: ['az'], source_snapshot_ids: ['snap']}}
    )
  end
end
