require 'test_helper'

class Foorm::SimpleSurveySubmissionTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @teacher = create :teacher
    @foorm_form = create :foorm_form
  end

  test 'save simple survey submission' do
    simple_survey_form = Foorm::SimpleSurveyForm.create({form_name: @foorm_form.name, form_version: 0, path: 'a_url'})

    simple_survey_submission = Foorm::SimpleSurveySubmission.new(user_id: @teacher.id, simple_survey_form_id: simple_survey_form.id)
    simple_survey_submission.save_with_foorm_submission({'question1': 'answer1'}, @foorm_form.name, @foorm_form.version)

    # Confirm that we saved an appropriate Foorm submission.
    assert_equal @foorm_form.name, simple_survey_submission.foorm_submission.form_name

    # Confirm that we're able to get metadata about how the survey was conducted via SimpleSurveyForm.
    assert_equal simple_survey_form.id, simple_survey_submission.simple_survey_form_id
  end
end
