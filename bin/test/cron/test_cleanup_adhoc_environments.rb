require_relative '../test_helper'
require_relative '../../cron/cleanup_adhoc_environments'

# A Note about Mocking AWS SDK Calls
#
# In the AWS SDK for Ruby, the Aws::EC2::Instance class is not meant to be
# directly instantiated and doesn't allow you to directly set its internal
# state, including tags or other attributes. Therefore it's generally easier and
# more efficient to use mocks and stubs to simulate these API responses.

class CleanupAdhocEnvironmentsTest < Minitest::Test
  def setup
    @cleaner = CleanupAdhocEnvironments.new(dry_run: true)
  end

  def test_dry_run_set_correctly
    assert @cleaner.dry_run
  end

  def test_get_adhoc_instances_applies_adhoc_filters
    # Mock instances tagged with different environments
    # Technically the API call should have already filtered out non-adhocs
    instances = ['adhoc', 'adhoc', 'test', 'production'].map do |env|
      instance = mock
      tag = Aws::EC2::Tag.new(key: 'environment', value: env, resource_id: 'none')
      instance.stubs(:tags).returns([tag])
      instance
    end

    expected_filters = {filters: [
      {name: 'tag:environment', values: ['adhoc']},
      {name: 'tag:aws:cloudformation:logical-id', values: ['WebServer']}
    ]}

    Aws::EC2::Resource.any_instance.expects(:instances).with(expected_filters).returns(instances)
    result = @cleaner.get_adhoc_instances.to_a

    # Assert that results are filtered to exclude non-adhocs (paranoid check)
    assert_equal 2, result.length
    assert_includes result, instances[0]
    assert_includes result, instances[1]
  end

  def test_tagged_stopped_instances_adds_stopped_at_tag
    instances = [mock, mock].each do |instance|
      instance.expects(:create_tags).with({tags: [{key: CleanupAdhocEnvironments::ADHOC_STOPPED_AT, value: Time.now.to_s}]})
    end
    @cleaner.tag_stopped_instances(instances)
  end

  def test_stop_running_adhoc_instances_skips_running_instances
    instance = mock
    instance.stubs(:state).returns(mock(name: 'stopped'))

    @cleaner.stubs(:get_adhoc_instances).returns([instance])

    Aws::EC2::Instance::Collection.any_instance.expects(:batch_stop).never
    @cleaner.expects(:tag_stopped_instances).never

    @cleaner.stop_running_adhoc_instances
  end

  def test_stop_running_adhoc_instances_skips_instances_with_termination_protection
    instance = mock
    instance.stubs(:state).returns(mock(name: 'running'))
    instance.stubs(:describe_attribute).returns(mock(disable_api_termination: mock(value: true)))

    @cleaner.stubs(:get_adhoc_instances).returns([instance])

    Aws::EC2::Instance::Collection.any_instance.expects(:batch_stop).never
    @cleaner.expects(:tag_stopped_instances).never

    @cleaner.stop_running_adhoc_instances
  end

  def test_stop_running_adhoc_instances_stops_instances
    instances = [mock, mock].each do |instance|
      instance.stubs(:state).returns(mock(name: 'running'))
      instance.stubs(:describe_attribute).returns(mock(disable_api_termination: mock(value: false)))
    end
    @cleaner.stubs(:get_adhoc_instances).returns(instances)

    Aws::EC2::Instance::Collection.any_instance.expects(:batch_stop).with({dry_run: true})

    @cleaner.stop_running_adhoc_instances
  end
end
