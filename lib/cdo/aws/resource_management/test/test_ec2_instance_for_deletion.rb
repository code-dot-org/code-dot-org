require 'webmock/minitest'
class TestEC2InstanceForDeletion < Minitest::Test
  # Mock the EC2 instance or AWS SDK calls
  MockEC2Instance = Struct.new(:tags) do
    def describe_attribute(attribute:)
      Struct.new(:disable_api_termination).new(Struct.new(:value).new(true))
    end

    def get_stack_name
      'my-stack'
    end

    def get_stop_time_in_seconds
      Time.now - 400 # Stopped for 400 seconds
    end
  end

  def setup
    puts "WAZZXA"
    @instance_for_deletion = EC2InstanceForDeletion.new(MockEC2Instance.new, deletion_tag: 'delete-tag', minimum_time_stopped_in_seconds: 300)
  end

  def test_api_termination_disabled
    assert !@instance_for_deletion.api_termination_disabled?
  end

  def test_has_stack_to_delete
    assert @instance_for_deletion.has_stack_to_delete?
  end

  def test_has_critical_stack
    refute @instance_for_deletion.has_critical_stack?
  end

  def test_old_enough
    assert @instance_for_deletion.old_enough?
  end
end
