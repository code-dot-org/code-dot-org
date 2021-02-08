require 'test_helper'

class Foorm::FormTest < ActiveSupport::TestCase
  test 'get latest form and version gets correct form' do
    form1 = create :foorm_form
    form2 = create :foorm_form, name: form1.name, version: form1.version + 1

    questions, version = Foorm::Form.get_questions_and_latest_version_for_name(form1.name)
    assert_equal JSON.parse(form2.questions), questions
    assert_equal form2.version, version
  end

  test 'readable_questions formats matrix questions for general workshop question' do
    form = build :foorm_form_csf_intro_post_survey
    readable_questions = form.readable_questions

    assert_equal 'How much do you agree or disagree with the following statements about the workshop overall? >> I feel more prepared to teach the material covered in this workshop than before I came.',
      readable_questions[:general]['overall_success-more_prepared']
  end

  test 'readable_questions formats matrix questions for facilitator-specific workshop question' do
    form = build :foorm_form_csf_intro_post_survey
    readable_questions = form.readable_questions

    assert_equal 'During my workshop, my facilitator did the following: >> Demonstrated knowledge of the curriculum.',
      readable_questions[:facilitator]['facilitator_effectiveness-demonstrated_knowledge']
  end

  test 'readable_questions formats comment questions for general workshop question' do
    form = build :foorm_form_csf_intro_post_survey
    readable_questions = form.readable_questions

    assert_equal 'What supported your learning the most today and why?',
      readable_questions[:general]['supported']
  end

  test 'readable_questions formats comment questions for facilitator workshop question' do
    form = build :foorm_form_csf_intro_post_survey
    readable_questions = form.readable_questions

    assert_equal 'What were two things my facilitator did well?',
      readable_questions[:facilitator]['k5_facilitator_did_well']
  end

  test 'readable_questions formats single select questions for general workshop question' do
    form = build :foorm_form_csf_intro_post_survey
    readable_questions = form.readable_questions

    assert_equal 'I give the workshop organizer permission to quote my written feedback from today for use on social media, promotional materials, and other communications.',
      readable_questions[:general]['permission']
  end

  test 'submissions_to_csv formats single general submission' do
    form = create :foorm_form_csf_intro_post_survey
    submission_workshop_metadata = create :csf_intro_post_workshop_submission, :answers_low
    submission = submission_workshop_metadata.foorm_submission

    other_headers = {
      'created_at' => 'created_at',
      'user_id' => 'user_id',
      'pd_workshop_id' => 'pd_workshop_id',
      'pd_session_id' => 'pd_session_id'
    }
    expected_headers = other_headers.merge form.readable_questions[:general]

    expected_response = submission.formatted_answers

    assert_equal get_csv_string([expected_headers.values, expected_response.values]), form.submissions_to_csv
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

  test 'submissions_to_csv formats submission of a form with only general questions' do
    form = create :foorm_form_summer_pre_survey
    workshop = create(:csd_summer_workshop)
    user = create(:teacher)
    general_submission_workshop_metadata = create(:day_0_workshop_foorm_submission, :answers_low, user: user, pd_workshop: workshop)

    general_submission = general_submission_workshop_metadata.foorm_submission

    other_general_headers = {
      'created_at' => 'created_at',
      'user_id' => 'user_id',
      'pd_workshop_id' => 'pd_workshop_id',
      'pd_session_id' => 'pd_session_id'
    }

    expected_headers = other_general_headers.
      merge(form.readable_questions[:general]).
      merge(form.readable_questions_with_facilitator_number(form.readable_questions, 1))

    expected_response = general_submission.formatted_answers

    assert_equal get_csv_string([expected_headers.values, expected_response.values_at(*expected_headers.keys)]),
      form.submissions_to_csv
  end

  test 'submissions_to_csv formats submission of general and facilitator specific questions' do
    form = create :foorm_form_csf_intro_post_survey
    workshop = create(:csf_101_workshop)
    user = create(:teacher)
    facilitator_submission_workshop_metadata = create(:csf_intro_post_facilitator_workshop_submission, :answers_low, user: user, pd_workshop: workshop)
    general_submission_workshop_metadata = create(:csf_intro_post_workshop_submission, :answers_low, user: user, pd_workshop: workshop)

    general_submission = general_submission_workshop_metadata.foorm_submission
    facilitator_submission = facilitator_submission_workshop_metadata.foorm_submission

    other_general_headers = {
      'created_at' => 'created_at',
      'user_id' => 'user_id',
      'pd_workshop_id' => 'pd_workshop_id',
      'pd_session_id' => 'pd_session_id'
    }

    other_facilitator_headers = {
      'facilitatorId_1' => 'facilitatorId_1',
      'facilitatorName_1' => 'facilitatorName_1'
    }

    expected_headers = other_general_headers.
      merge(form.readable_questions[:general]).
      merge(other_facilitator_headers).
      merge(form.readable_questions_with_facilitator_number(form.readable_questions, 1))

    expected_response = general_submission.formatted_answers.
      merge(facilitator_submission.formatted_answers_with_facilitator_number(1))

    assert_equal get_csv_string([expected_headers.values, expected_response.values_at(*expected_headers.keys)]),
      form.submissions_to_csv
  end

  test 'submissions_to_csv formats multiple submissions where one did not answer facilitator-specific questions' do
    form = create :foorm_form_csf_intro_post_survey
    workshop = create(:csf_101_workshop)
    user = create(:teacher)
    facilitator_submission_workshop_metadata_1 = create(:csf_intro_post_facilitator_workshop_submission, :answers_low, user: user, pd_workshop: workshop)
    general_submission_workshop_metadata_1 = create(:csf_intro_post_workshop_submission, :answers_low, user: user, pd_workshop: workshop)
    general_submission_workshop_metadata_2 = create(:csf_intro_post_workshop_submission, :answers_low)

    general_submission_1 = general_submission_workshop_metadata_1.foorm_submission
    facilitator_submission_1 = facilitator_submission_workshop_metadata_1.foorm_submission
    general_submission_2 = general_submission_workshop_metadata_2.foorm_submission

    other_general_headers = {
      'created_at' => 'created_at',
      'user_id' => 'user_id',
      'pd_workshop_id' => 'pd_workshop_id',
      'pd_session_id' => 'pd_session_id'
    }

    other_facilitator_headers = {
      'facilitatorId_1' => 'facilitatorId_1',
      'facilitatorName_1' => 'facilitatorName_1'
    }

    expected_headers = other_general_headers.
      merge(form.readable_questions[:general]).
      merge(other_facilitator_headers).
      merge(form.readable_questions_with_facilitator_number(form.readable_questions, 1))

    expected_response_1 = general_submission_1.formatted_answers.
      merge(facilitator_submission_1.formatted_answers_with_facilitator_number(1))

    expected_response_2 = general_submission_2.formatted_answers

    expected_rows = [
      expected_headers.values,
      expected_response_1.values_at(*expected_headers.keys),
      expected_response_2.values_at(*expected_headers.keys)
    ]

    assert_equal get_csv_string(expected_rows),
      form.submissions_to_csv
  end

  test 'submissions_to_csv can be filtered with an array of submissions' do
    form = create :foorm_form_csf_intro_post_survey
    workshop = create(:csf_101_workshop)
    user = create(:teacher)
    # create multiple submissions
    facilitator_submission_workshop_metadata_1 = create(:csf_intro_post_facilitator_workshop_submission, :answers_low, user: user, pd_workshop: workshop)
    general_submission_workshop_metadata_1 = create(:csf_intro_post_workshop_submission, :answers_low, user: user, pd_workshop: workshop)
    create(:csf_intro_post_workshop_submission, :answers_low)

    general_submission_1 = general_submission_workshop_metadata_1.foorm_submission
    facilitator_submission_1 = facilitator_submission_workshop_metadata_1.foorm_submission

    other_general_headers = {
      'created_at' => 'created_at',
      'user_id' => 'user_id',
      'pd_workshop_id' => 'pd_workshop_id',
      'pd_session_id' => 'pd_session_id'
    }

    other_facilitator_headers = {
      'facilitatorId_1' => 'facilitatorId_1',
      'facilitatorName_1' => 'facilitatorName_1'
    }

    expected_headers = other_general_headers.
      merge(form.readable_questions[:general]).
      merge(other_facilitator_headers).
      merge(form.readable_questions_with_facilitator_number(form.readable_questions, 1))

    expected_response_1 = general_submission_1.formatted_answers.
      merge(facilitator_submission_1.formatted_answers_with_facilitator_number(1))

    # filter on just one of the submissions, expect to only see that submission's data
    expected_rows = [
      expected_headers.values,
      expected_response_1.values_at(*expected_headers.keys)
    ]

    assert_equal get_csv_string(expected_rows),
      form.submissions_to_csv([general_submission_1])
  end

  test 'submissions_to_csv filter will throw out invalid submissions' do
    form = create :foorm_form_csf_intro_post_survey
    workshop = create(:csf_101_workshop)
    user = create(:teacher)
    facilitator_submission_workshop_metadata_1 = create(:csf_intro_post_facilitator_workshop_submission, :answers_low, user: user, pd_workshop: workshop)
    general_submission_workshop_metadata_1 = create(:csf_intro_post_workshop_submission, :answers_low, user: user, pd_workshop: workshop)
    # this submission should get thrown out from the filter because it is for a different form
    other_form_workshop_metadata = create(:day_0_workshop_foorm_submission, :answers_low)

    general_submission_1 = general_submission_workshop_metadata_1.foorm_submission
    facilitator_submission_1 = facilitator_submission_workshop_metadata_1.foorm_submission
    other_submission = other_form_workshop_metadata.foorm_submission

    other_general_headers = {
      'created_at' => 'created_at',
      'user_id' => 'user_id',
      'pd_workshop_id' => 'pd_workshop_id',
      'pd_session_id' => 'pd_session_id'
    }

    other_facilitator_headers = {
      'facilitatorId_1' => 'facilitatorId_1',
      'facilitatorName_1' => 'facilitatorName_1'
    }

    expected_headers = other_general_headers.
      merge(form.readable_questions[:general]).
      merge(other_facilitator_headers).
      merge(form.readable_questions_with_facilitator_number(form.readable_questions, 1))

    expected_response_1 = general_submission_1.formatted_answers.
      merge(facilitator_submission_1.formatted_answers_with_facilitator_number(1))

    expected_rows = [
      expected_headers.values,
      expected_response_1.values_at(*expected_headers.keys)
    ]

    assert_equal get_csv_string(expected_rows),
      form.submissions_to_csv([general_submission_1, other_submission])
  end

  test 'creating new form writes to file in levelbuilder mode' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.expects(:write).once

    create :foorm_form
  end

  test 'creating new form does not write file in non levelbuilder mode' do
    File.expects(:write).never

    create :foorm_form
  end

  test 'updating form writes to file in levelbuilder mode' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.expects(:write).twice

    form = create :foorm_form
    form.questions = JSON.generate({pages: [{elements: [{name: "test"}]}]})
    form.save
  end

  test 'updating form does not write to file in non levelbuilder mode' do
    File.expects(:write).never

    form = create :foorm_form
    form.questions = JSON.generate({pages: [{elements: [{name: "test"}]}]})
    form.save
  end

  test 'form only writes to file on save if it has changed' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.expects(:write).once

    # should write to file
    form = create :foorm_form
    # should not write to file, form did not change
    form.save
  end

  private

  def get_csv_string(expected_values)
    CSV.generate do |csv|
      expected_values.each {|row| csv << row}
    end
  end
end
