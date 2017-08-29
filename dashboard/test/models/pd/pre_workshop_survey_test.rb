require 'test_helper'

class Pd::PreWorkshopSurveyTest < ActiveSupport::TestCase
  setup do
    Pd::Workshop.any_instance.stubs(:pre_survey_units_and_lessons).returns(
      [
        ['Unit 1', ['Lesson 1: L1', 'Lesson 2: L2']],
        ['Unit 2', ['Lesson 1: L3']]
      ]
    )
  end

  test 'required field validations' do
    survey = Pd::PreWorkshopSurvey.new
    survey.pd_enrollment = create :pd_enrollment, user: create(:user)

    refute survey.valid?
    assert_equal [
      'Form data is required',
    ], survey.errors.full_messages

    survey.form_data = {}.to_json
    refute survey.valid?
    assert_equal [
      'Form data unit',
      'Form data lesson',
      'Form data questionsAndTopics',
    ], survey.errors.full_messages

    survey.form_data = {
      unit: 'Unit 1',
      lesson: 'Lesson 1: L1',
      questionsAndTopics: 'I have so many questions'
    }.to_json
    assert survey.valid?
  end

  test 'lesson options depend on unit selection' do
    survey = Pd::PreWorkshopSurvey.new
    survey.pd_enrollment = create :pd_enrollment, user: create(:user)
    survey.form_data = {
      unit: 'Unit 2',
      lesson: 'Lesson 2: L2',
      questionsAndTopics: 'I have so many questions'
    }.to_json

    refute survey.valid?
    assert_equal [
      'Form data lesson'
    ], survey.errors.full_messages

    survey.form_data = survey.sanitize_form_data_hash.merge({unit: 'Unit 1'}).to_json
    assert survey.valid?
  end
end
