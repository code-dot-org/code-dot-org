require_relative '../../test_helper'
require 'aws-sdk-autoscaling'
require 'cdo/aws/ec2_autoscaling'

class TestEC2Autoscaling < Minitest::Test
  def mock_autoscaling_group_instances(count = 1)
    instances = []
    count.times do
      instances << Aws::AutoScaling::Types::Instance.new(
        instance_id: 'i-' + SecureRandom.hex(8),
        lifecycle_state: 'InService'
      )
    end
    return instances
  end

  def mock_autoscaling_groups(count = 1)
    groups = []
    count.times do
      random_group_name = 'test-group-' + SecureRandom.hex(8)
      groups << Aws::AutoScaling::Types::AutoScalingGroup.new(
        auto_scaling_group_name: random_group_name,
        instances: mock_autoscaling_group_instances(3)
      )
    end
    return groups
  end

  def test_refresh_instances_in_group_raises_when_no_groups_found
    empty_response = Aws::AutoScaling::Types::AutoScalingGroupsType.new(auto_scaling_groups: [])
    Aws::AutoScaling::Client.any_instance.stubs(:describe_auto_scaling_groups).with(auto_scaling_group_names: ['nonexistent-group']).returns(empty_response)

    assert_raises(RuntimeError) {AWS::EC2Autoscaling.refresh_instances_in_group('nonexistent-group')}
  end

  def test_refresh_instances_in_group_raises_when_too_many_groups_found
    # The implementation searches for the group by name, which returns an array. Lets make sure it's only got one item.
    multiple_response = Aws::AutoScaling::Types::AutoScalingGroupsType.new(auto_scaling_groups: mock_autoscaling_groups(2))
    Aws::AutoScaling::Client.any_instance.expects(:describe_auto_scaling_groups).with(auto_scaling_group_names: ['overloaded-group']).returns(multiple_response)

    assert_raises(RuntimeError) {AWS::EC2Autoscaling.refresh_instances_in_group('overloaded-group')}
  end

  def test_refresh_instances_in_group_triggers_instance_refresh_with_parameters
    # The implementation should call describe_auto_scaling_groups with the given group name.
    describe_response = Aws::AutoScaling::Types::AutoScalingGroupsType.new(auto_scaling_groups: mock_autoscaling_groups)
    Aws::AutoScaling::Client.any_instance.expects(:describe_auto_scaling_groups).with(auto_scaling_group_names: ['test-group']).returns(describe_response)

    Aws::AutoScaling::Client.any_instance.expects(:start_instance_refresh).with do |params|
      # The only required parameter is the AutoScalingGroupName, but to ensure a speedy refresh
      # we want to edit these values but leave all others default. The default values are:
      # https://docs.aws.amazon.com/autoscaling/ec2/userguide/understand-instance-refresh-default-values.html
      params[:auto_scaling_group_name] == 'test-group' &&
        params[:preferences][:min_healthy_percentage] == 100 &&
        params[:preferences][:max_healthy_percentage] == 200 &&
        params[:preferences][:instance_warmup] == 0 &&
        params.keys.length == 2 && # No other params
        params[:preferences].keys.length == 3 # No other preferences
    end

    AWS::EC2Autoscaling.refresh_instances_in_group('test-group')
  end

  def test_refresh_instances_in_group_does_not_wait_for_instance_refresh_to_complete_by_default
    describe_response = Aws::AutoScaling::Types::AutoScalingGroupsType.new(auto_scaling_groups: mock_autoscaling_groups)
    Aws::AutoScaling::Client.any_instance.stubs(:describe_auto_scaling_groups).returns(describe_response)
    Aws::AutoScaling::Client.any_instance.expects(:start_instance_refresh)

    Aws::AutoScaling::Client.any_instance.expects(:wait_until).never
    AWS::EC2Autoscaling.refresh_instances_in_group('test-group')
  end

  def test_refresh_instances_in_group_waits_until_instance_refresh_is_complete_if_flag_passed
    describe_response = Aws::AutoScaling::Types::AutoScalingGroupsType.new(auto_scaling_groups: mock_autoscaling_groups)
    Aws::AutoScaling::Client.any_instance.stubs(:describe_auto_scaling_groups).returns(describe_response)
    Aws::AutoScaling::Client.any_instance.expects(:start_instance_refresh)

    Aws::AutoScaling::Client.any_instance.expects(:wait_until).with(:instances_healthy, auto_scaling_group_names: ['test-group'])
    AWS::EC2Autoscaling.refresh_instances_in_group('test-group', wait: true)
  end

  # get_autoscaling_group_for_current_environment
  def test_get_autoscaling_group_for_current_environment_raises_when_no_matching_group_found
    empty_response = Aws::AutoScaling::Types::AutoScalingGroupsType.new(auto_scaling_groups: [])
    Aws::AutoScaling::Client.any_instance.stubs(:describe_auto_scaling_groups).returns(empty_response)

    assert_raises(RuntimeError) {AWS::EC2Autoscaling.get_autoscaling_group_for_current_environment}
  end

  def test_get_autoscaling_group_for_current_environment_returns_group_matching_stack_name_and_logical_id
    CDO.stubs(:stack_name).returns('test-stack')

    groups = mock_autoscaling_groups(4)
    # This soup is too cold
    groups[0].tags = [
      Aws::AutoScaling::Types::TagDescription.new(key: 'aws:cloudformation:stack-name', value: 'test-stack')
    ]
    # This soup is too hot
    groups[1].tags = [
      Aws::AutoScaling::Types::TagDescription.new(key: 'aws:cloudformation:logical-id', value: 'Frontends')
    ]
    # Good soup
    groups[2].tags = [
      Aws::AutoScaling::Types::TagDescription.new(key: 'aws:cloudformation:stack-name', value: 'test-stack'),
      Aws::AutoScaling::Types::TagDescription.new(key: 'aws:cloudformation:logical-id', value: 'Frontends')
    ]
    # No soup for you
    groups[3].tags = nil

    describe_response = Aws::AutoScaling::Types::AutoScalingGroupsType.new(auto_scaling_groups: groups)
    Aws::AutoScaling::Client.any_instance.stubs(:describe_auto_scaling_groups).returns(describe_response)

    assert_equal(groups[2].auto_scaling_group_name, AWS::EC2Autoscaling.get_autoscaling_group_for_current_environment)
  end
end
