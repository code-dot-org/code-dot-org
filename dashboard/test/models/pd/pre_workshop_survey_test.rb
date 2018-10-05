require 'test_helper'

class Pd::PreWorkshopSurveyTest < ActiveSupport::TestCase
  UNIT_1 = 'Unit 1 - This is the first unit'
  LESSON_1_1 = "Lesson 1: This is the first unit's first lesson"
  LESSON_1_2 = "Lesson 2: This is the first unit's second lesson"
  UNIT_2 = 'Unit 2 - This is the second unit'
  LESSON_2_1 = "Lesson 1 - This is the second unit's first lesson"

  setup do
    Pd::Workshop.any_instance.stubs(:pre_survey_units_and_lessons).returns(
      [
        [UNIT_1, [LESSON_1_1, LESSON_1_2]],
        [UNIT_2, [LESSON_2_1]]
      ]
    )
  end

  test 'required field validations' do
    survey = build :pd_pre_workshop_survey

    refute survey.valid?
    assert_equal [
      'Form data is required',
    ], survey.errors.full_messages

    survey.form_data = {}.to_json
    refute survey.valid?
    assert_equal [
      'Form data unit',
      'Form data lesson'
    ], survey.errors.full_messages

    survey.form_data = {
      unit: UNIT_1,
      lesson: LESSON_1_1
    }.to_json
    assert survey.valid?
  end

  test 'lesson is not required when not-started is chosen for unit' do
    survey = build :pd_pre_workshop_survey, form_data: {
      unit: Pd::PreWorkshopSurvey::UNIT_NOT_STARTED,
      questionsAndTopics: 'I have so many questions'
    }.to_json

    assert survey.valid?
  end

  test 'lesson is required when an actual unit is selected' do
    survey = build :pd_pre_workshop_survey, form_data: {
      unit: UNIT_1,
      questionsAndTopics: 'I have so many questions'
    }.to_json

    refute survey.valid?
    assert_equal [
      'Form data lesson'
    ], survey.errors.full_messages
  end

  test 'lesson options depend on unit selection' do
    survey = build :pd_pre_workshop_survey, form_data: {
      unit: UNIT_2,
      lesson: LESSON_1_2
    }.to_json

    refute survey.valid?
    assert_equal [
      'Form data lesson'
    ], survey.errors.full_messages

    survey.form_data = survey.sanitize_form_data_hash.merge({unit: UNIT_1}).to_json
    assert survey.valid?
  end

  test 'unit_lesson_short_name extracts unit and lesson number' do
    survey = build :pd_pre_workshop_survey, form_data: {
      unit: UNIT_1,
      lesson: LESSON_1_2
    }.to_json

    assert_equal 'U1 L2', survey.unit_lesson_short_name
  end

  test 'unit_lesson_short_name falls back to long name if numbers cannot be extracted' do
    survey = build :pd_pre_workshop_survey, form_data: {
      unit: 'Custom oddly formatted unit name',
      lesson: 'Custom oddly formatted lesson name'
    }.to_json

    assert_equal 'Custom oddly formatted unit name, Custom oddly formatted lesson name', survey.unit_lesson_short_name
  end

  test 'unit_lesson_short_name returns nil for unit not started' do
    survey = build :pd_pre_workshop_survey, form_data: {
      unit: Pd::PreWorkshopSurvey::UNIT_NOT_STARTED
    }.to_json

    assert_nil survey.unit_lesson_short_name
  end

  test 'unit_lesson_short_name defaults to L1 when lesson is missing' do
    # Lesson should be required when a unit is selected, but we had a bug
    # and some older data has unit but no lesson. In these cases, default to lesson 1
    survey = build :pd_pre_workshop_survey, form_data: {
      unit: UNIT_1
    }.to_json

    assert_equal 'U1 L1', survey.unit_lesson_short_name
  end
end
