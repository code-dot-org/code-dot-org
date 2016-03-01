require 'test_helper'

class PlcHelpersTest < ActionView::TestCase
  include Plc::CoursesHelper
  include Plc::LearningModulesHelper

  def setup
    @learning_module1 = create(:plc_learning_module, name: 'Module1')
    @learning_module2 = create(:plc_learning_module, name: 'Module2')

    @course1 = create(:plc_course, name: 'Course1')
    @course2 = create(:plc_course, name: 'Course2')
  end

  def test_learning_module_helpers
    assert [[@course1.name, @course1.id],[@course2.name, @course2.id]], options_for_user_enrollment_courses
    assert [[@learning_module1.name, @learning_module1.id],[@learning_module2.name, @learning_module2.id]], options_for_plc_task_learning_modules
  end
end
