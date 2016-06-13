require 'test_helper'

class Plc::CourseUnitTest < ActiveSupport::TestCase
  setup do
    course = create (:plc_course)
    @course_unit = create(:plc_course_unit, plc_course: course)
  end

  test 'test identification of learning resources' do
    learning_module1 = create(:plc_learning_module, plc_course_unit: @course_unit)
    learning_module2 = create(:plc_learning_module, plc_course_unit: @course_unit)
    learning_resource_task = create(:plc_learning_resource_task, name: 'Task 1', plc_learning_modules: [learning_module1])
    create(:plc_task, name: 'Task 2', plc_learning_modules: [learning_module2])

    assert_equal [learning_resource_task], @course_unit.get_all_possible_learning_resources
  end
end
