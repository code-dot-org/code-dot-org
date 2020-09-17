require 'test_helper'

class Foorm::MiscSurveyTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @teacher = create :teacher
    @foorm_form = create :foorm_form
  end

  test 'save misc survey with submission' do
    workshop_survey = Foorm::MiscSurvey.new(user_id: @teacher.id, misc_form_path: 'sample')
    workshop_survey.save_with_foorm_submission({'question1': 'answer1'}, @foorm_form.name, @foorm_form.version)
    assert_equal @foorm_form.name, workshop_survey.foorm_submission.form_name
  end
end
