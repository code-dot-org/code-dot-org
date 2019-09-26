require 'test_helper'

class InlineAnswerTest < ActiveSupport::TestCase
  setup_all do
    @teacher = create :teacher
    @student = create :student
  end

  test 'visible? returns true in levelbuilder' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    assert Policies::InlineAnswer.visible?(@student, nil)
    assert Policies::InlineAnswer.visible?(@student, create(:script_level))
  end

  test 'visible? returns false for non teachers' do
    assert_not Policies::InlineAnswer.visible?(@student, create(:script_level))
  end

  test 'visible? returns true for authorized teachers in csp' do
    create(:plc_user_course_enrollment, plc_course: create(:plc_course), user: @teacher)
    assert Policies::InlineAnswer.visible?(@teacher, create(:script_level))
  end
end
