require 'test_helper'

class Plc::CourseUnitsTest < ActiveSupport::TestCase
  setup do
    course = create (:plc_course)
    learning_module1 = create(:plc_learning_module)
    learning_module2 = create(:plc_learning_module)
    @learning_resource_task = create(:plc_learning_resource_task, name: 'Task 1', plc_learning_module: learning_module1)
    @other_task = create(:plc_script_completion_task, name: 'Task 2', plc_learning_module: learning_module2)
    @course_unit = create(:plc_course_unit, plc_course: course)
    evaluation_question = create(:plc_evaluation_question, plc_course_unit: @course_unit)
    create(:plc_evaluation_answer, plc_evaluation_question: evaluation_question, plc_learning_module: learning_module1)
    create(:plc_evaluation_answer, plc_evaluation_question: evaluation_question, plc_learning_module: learning_module2)
  end

  test 'test identification of learning resources' do
    assert_equal [@learning_resource_task], @course_unit.get_all_possible_learning_resources
  end
end
