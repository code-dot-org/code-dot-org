require_relative '../../../../../shared/test/common_test_helper'
require_relative '../ec2_instance_for_deletion'

class TestEC2InstanceForDeletion < Minitest::Test
  class MockEC2Instance
    attr_accessor :tags

    def initialize(api_disabled, tags)
      @tags = tags
      @api_disabled = api_disabled
    end

    def describe_attribute(attribute:)
      aws_response = OpenStruct.new(value: @api_disabled)
      OpenStruct.new(disable_api_termination: aws_response)
    end

    def stack_name
      @tags.find {|tag| tag.key == 'aws:cloudformation:stack-name'}&.value
    end

    def stop_time_in_seconds
      stopped_at_tag = @tags.find {|tag| tag.key == 'deletionTime'}
      return nil if stopped_at_tag.nil?
      DateTime.parse(stopped_at_tag.value)
    end
  end

  TOO_SOON_TIME_TO_DELETE = Time.now - (5 * 24 * 60 * 60)
  READY_TO_DELETE_TIME_IN_SECS = Time.now - (7 * 24 * 60 * 60)

  def test_eligible_instance_can_be_deleted
    instance = tagged_instance(READY_TO_DELETE_TIME_IN_SECS, false)
    instance.stub(:has_critical_stack?, false) do
      assert instance.can_be_deleted?, "Instance should be eligible for deletion"
    end
  end

  def test_cannot_be_deleted_scenario_time_ready
    delete_time = READY_TO_DELETE_TIME_IN_SECS
    instance = tagged_instance(delete_time, false)

    refute_eligibility_for_deletion(instance, :has_critical_stack?, true, "Instance should not be eligible when it has a critical stack")
    refute_eligibility_for_deletion(instance, :has_reached_minimum_stop_time?, false, "Instance should not be eligible when minimum stop time is not reached")
  end

  def test_cannot_be_deleted_scenario_too_soon
    delete_time = TOO_SOON_TIME_TO_DELETE
    instance = tagged_instance(delete_time, true)
    refute instance.can_be_deleted?
    refute_eligibility_for_deletion(instance, :has_critical_stack?, false, "Instance should not be eligible when it has a critical stack")
  end

  private

  def tagged_instance(deletion_time, api_disabled)
    create_ec2_instance_for_deletion(
      api_disabled,
      'aws:cloudformation:stack-name' => 'test-stack',
      'deletionTime' => deletion_time.to_s
    )
  end

  def create_ec2_instance_for_deletion(api_disabled, tags)
    instance = MockEC2Instance.new(api_disabled, tags.map {|key, value| OpenStruct.new(key: key, value: value)})
    EC2InstanceForDeletion.new(instance)
  end

  def refute_eligibility_for_deletion(instance, method_to_stub, value, message)
    instance.stub(method_to_stub, value) do
      refute instance.can_be_deleted?, message
    end
  end
end
