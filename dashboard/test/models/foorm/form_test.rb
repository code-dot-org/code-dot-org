require 'test_helper'

class Foorm::FormTest < ActiveSupport::TestCase
  test 'get latest form and version gets correct form' do
    form1 = create :foorm_form
    form2 = create :foorm_form, name: form1.name, version: form1.version + 1

    questions, version = Foorm::Form.get_questions_and_latest_version_for_name(form1.name)
    assert_equal JSON.parse(form2.questions), questions
    assert_equal form2.version, version
  end

  test 'Form validation passes for valid questions' do
    summer_pre_form = build :foorm_form_summer_pre_survey
    assert summer_pre_form.valid?
  end

  test 'Form with duplicate question names is invalid' do
    invalid_form = build :foorm_form_duplicate_question_survey
    refute invalid_form.valid?
  end

  test 'Form with duplicate choice names is invalid' do
    invalid_form = build :foorm_form_duplicate_choice_survey
    refute invalid_form.valid?
  end
end
