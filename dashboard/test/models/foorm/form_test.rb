require 'test_helper'

class Foorm::FormTest < ActiveSupport::TestCase
  test 'get latest form and version gets correct form' do
    form1 = create :foorm_form
    form2 = create :foorm_form, name: form1.name, version: form1.version + 1

    questions, version = Foorm::Form.get_questions_and_latest_version_for_name(form1.name)
    assert_equal JSON.parse(form2.questions), questions
    assert_equal form2.version, version
  end

  test 'merge_form_questions_and_config_variables works with no config variables' do
    form = create :foorm_form_summer_post_survey
    submission = create :daily_workshop_day_5_foorm_submission, :answers_high_with_survey_config_variables

    expected_keys = form.readable_questions.keys | submission.formatted_answers.keys

    assert_equal expected_keys,
      form.merge_form_questions_and_config_variables(submission.formatted_answers).keys
  end

  test 'merge_form_questions_and_config_variables works with config variables' do
    form = create :foorm_form_summer_post_survey
    submission = create :daily_workshop_day_5_foorm_submission, :answers_high

    assert_equal form.readable_questions.keys,
      form.merge_form_questions_and_config_variables(submission.formatted_answers).keys
  end
end
