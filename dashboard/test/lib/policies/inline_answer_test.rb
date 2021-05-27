require 'test_helper'

class Policies::InlineAnswerTest < ActiveSupport::TestCase
  setup_all do
    @authorized_teacher = create :authorized_teacher
    @teacher = create :teacher
    @student = create :student
  end

  test 'visible? returns true for authorized teachers' do
    assert Policies::InlineAnswer.visible?(@authorized_teacher, create(:script_level))
  end

  test 'visible? returns false for non teachers' do
    refute Policies::InlineAnswer.visible?(@student, create(:script_level))
  end

  test 'visible? returns false for non-authorized teachers' do
    refute Policies::InlineAnswer.visible?(@teacher, create(:script_level))
  end

  test 'visible? returns true in levelbuilder' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    assert Policies::InlineAnswer.visible?(@student, nil)
    assert Policies::InlineAnswer.visible?(@student, create(:script_level))
  end

  test 'visible? returns false for PLC courses (even for authorized teachers)' do
    plc_script = create(:script, professional_learning_course: true)
    refute Policies::InlineAnswer.visible?(@authorized_teacher, create(:script_level, script: plc_script))
  end

  test 'visible? returns true for all kinds of users if the lesson is in readonly mode for that user' do
    script_level = create(:script_level)
    create(:user_level, user: @student, level: script_level.level, submitted: true, readonly_answers: true)
    assert Policies::InlineAnswer.visible?(@student, script_level)
  end
end
