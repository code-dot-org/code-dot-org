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
    create(:plc_script_completion_task, name: 'Task 2', plc_learning_modules: [learning_module2])

    assert_equal [learning_resource_task], @course_unit.get_all_possible_learning_resources
  end

  test 'test can identify one content and one practice module from list of answers' do
    @course_unit.plc_learning_modules.destroy_all

    content_learning_module1, content_learning_module2, content_learning_module3, content_learning_module4 =
      4.times.map {create(:plc_learning_module, plc_course_unit: @course_unit, module_type: Plc::LearningModule::CONTENT_MODULE)}

    practice_learning_module1, practice_learning_module2, practice_learning_module3, practice_learning_module4 =
      4.times.map {create(:plc_learning_module, plc_course_unit: @course_unit, module_type: Plc::LearningModule::PRACTICE_MODULE)}

    selected_learning_module_ids = [content_learning_module1.id, content_learning_module2.id, content_learning_module2.id, content_learning_module3.id, content_learning_module4.id, content_learning_module2.id, content_learning_module1.id,
                                    practice_learning_module1.id, practice_learning_module1.id, practice_learning_module2.id, practice_learning_module3.id, practice_learning_module4.id, practice_learning_module3.id, practice_learning_module3.id]

    top_learning_modules = @course_unit.get_top_modules_of_each_type_from_user_selections(selected_learning_module_ids)

    assert_equal 2, top_learning_modules.size
    assert top_learning_modules.include? content_learning_module2
    assert top_learning_modules.include? practice_learning_module3

    top_learning_modules = @course_unit.get_top_modules_of_each_type_from_user_selections([])
    assert_empty top_learning_modules

    top_learning_modules = @course_unit.get_top_modules_of_each_type_from_user_selections([content_learning_module1.id, content_learning_module1.id])
    assert_equal [content_learning_module1], top_learning_modules
  end
end
