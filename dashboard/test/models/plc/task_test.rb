require 'test_helper'

class Plc::TaskTest < ActiveSupport::TestCase
  setup do
    @learning_module = create(:plc_learning_module, name: 'Module1')
  end

  test 'Creating different kinds of tasks leads to expected module naming with expected properties' do
    learning_resource_task = Plc::LearningResourceTask.create(resource_url: 'SomeUrl', plc_learning_modules: [@learning_module])

    assert_equal 'SomeUrl', learning_resource_task.resource_url
    assert_equal 'learning_resource_task', learning_resource_task.class.underscored_task_type
    assert_equal 'Learning Resource Task', learning_resource_task.class.titleized_task_type
  end
end
