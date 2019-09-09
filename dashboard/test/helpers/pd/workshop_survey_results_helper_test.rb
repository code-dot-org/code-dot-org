require 'test_helper'

class Pd::WorkshopSurveyResultsHelperTest < ActionView::TestCase
  include Pd::WorkshopSurveyResultsHelper
  include Pd::JotForm::Constants
  include Pd::SharedWorkshopConstants

  FORM_IDS = {
    summer: {
      pre_workshop: 0,
      day_1: 1,
      day_2: 2,
      day_3: 3,
      day_4: 4,
      day_5: 5,
      facilitator: 6
    },
    academic_year_1_2: {
      day_1: 7,
      day_2: 8,
      facilitator: 9,
      post_workshop: 10
    }
  }

  self.use_transactional_test_case = true
  setup_all do
    @workshop = create :csp_summer_workshop
    @workshop.facilitators.each_with_index {|f, i| f.update(name: "Facilitator Person #{i + 1}")}
    @academic_year_workshop = create :csp_academic_year_workshop, :two_day

    @pre_workshop_questions = [
      Pd::JotForm::MatrixQuestion.new(
        id: 1,
        name: 'sampleMatrix',
        type: TYPE_MATRIX,
        text: 'How do you feel about these statements?',
        options: %w(Strongly\ Agree Agree Neutral Disagree Strongly\ Disagree),
        sub_questions: ['I am excited for {workshopCourse}', 'I am prepared for {workshopCourse}']
      ),
      Pd::JotForm::ScaleQuestion.new(
        id: 2,
        name: 'sampleScale',
        text: 'Do you like {workshopCourse}?',
        options: %w(Strongly\ Agree Strongly\ Disagree),
        values: (1..5).to_a,
        type: TYPE_SCALE
      ),
      Pd::JotForm::TextQuestion.new(
        id: 3,
        name: 'sampleText',
        text: 'Write some thoughts here',
        type: TYPE_TEXTBOX
      )
    ]

    @daily_questions = [
      Pd::JotForm::ScaleQuestion.new(
        id: 1,
        name: 'sampleDailyScale',
        text: 'How was your day?',
        options: %w(Poor Excellent),
        values: (1..5).to_a,
        type: TYPE_SCALE
      )
    ]

    @daily_facilitator_questions = [
      Pd::JotForm::TextQuestion.new(
        id: 1,
        name: 'sampleFacilitatorText',
        text: 'How was the facilitator?',
        type: TYPE_TEXTBOX
      ),
      Pd::JotForm::ScaleQuestion.new(
        id: 2,
        name: 'sampleFacilitatorScale',
        text: 'How do you rate the facilitators skills?',
        options: %w(Weak Amazing),
        values: (1..5).to_a,
        type: TYPE_SCALE
      ),
      Pd::JotForm::TextQuestion.new(
        id: 3,
        name: 'facilitatorId',
        text: 'facilitatorId',
        type: TYPE_TEXTBOX,
        hidden: true
      )
    ]

    @post_workshop_questions = [
      Pd::JotForm::TextQuestion.new(
        id: 1,
        name: 'samplePostText',
        text: 'What is your favorite thing about Computer Science?',
        type: TYPE_TEXTBOX
      ),
      Pd::JotForm::ScaleQuestion.new(
        id: 2,
        name: 'samplePostScale',
        text: 'How excited are you to teach CS?',
        options: %w(Meh Psyched),
        values: (1..5).to_a,
        type: TYPE_SCALE
      )
    ]

    Pd::SurveyQuestion.create(
      form_id: FORM_IDS[:summer][:pre_workshop],
      questions: Pd::JotForm::FormQuestions.new(FORM_IDS[:summer][:pre_workshop], @pre_workshop_questions).serialize.to_json
    )

    Pd::SurveyQuestion.create(
      form_id: FORM_IDS[:summer][:day_1],
      questions: Pd::JotForm::FormQuestions.new(FORM_IDS[:summer][:day_1], @daily_questions).serialize.to_json
    )

    Pd::SurveyQuestion.create(
      form_id: FORM_IDS[:summer][:day_2],
      questions: Pd::JotForm::FormQuestions.new(FORM_IDS[:summer][:day_2], @daily_questions).serialize.to_json
    )

    Pd::SurveyQuestion.create(
      form_id: FORM_IDS[:summer][:day_3],
      questions: Pd::JotForm::FormQuestions.new(FORM_IDS[:summer][:day_3], @daily_questions).serialize.to_json
    )

    Pd::SurveyQuestion.create(
      form_id: FORM_IDS[:summer][:day_4],
      questions: Pd::JotForm::FormQuestions.new(FORM_IDS[:summer][:day_4], @daily_questions).serialize.to_json
    )

    Pd::SurveyQuestion.create(
      form_id: FORM_IDS[:summer][:day_5],
      questions: Pd::JotForm::FormQuestions.new(FORM_IDS[:summer][:day_5], @daily_questions).serialize.to_json
    )

    Pd::SurveyQuestion.create(
      form_id: FORM_IDS[:summer][:facilitator],
      questions: Pd::JotForm::FormQuestions.new(FORM_IDS[:facilitator], @daily_facilitator_questions).serialize.to_json
    )

    Pd::SurveyQuestion.create(
      form_id: FORM_IDS[:academic_year_1_2][:day_1],
      questions: Pd::JotForm::FormQuestions.new(FORM_IDS[:academic_year_1_2][:day_1], @daily_questions).serialize.to_json
    )

    Pd::SurveyQuestion.create(
      form_id: FORM_IDS[:academic_year_1_2][:day_2],
      questions: Pd::JotForm::FormQuestions.new(FORM_IDS[:academic_year_1_2][:day_2], @daily_questions).serialize.to_json
    )

    Pd::SurveyQuestion.create(
      form_id: FORM_IDS[:academic_year_1_2][:facilitator],
      questions: Pd::JotForm::FormQuestions.new(FORM_IDS[:academic_year_1_2][:facilitator], @daily_facilitator_questions).serialize.to_json
    )

    Pd::SurveyQuestion.create(
      form_id: FORM_IDS[:academic_year_1_2][:post_workshop],
      questions: Pd::JotForm::FormQuestions.new(FORM_IDS[:academic_year_1_2][:post_workshop], @post_workshop_questions).serialize.to_json
    )

    expected_daily_questions = {
      general: {
        'sampleDailyScale' => {
          text: 'How was your day?',
          answer_type: ANSWER_SCALE,
          min_value: 1,
          max_value: 5,
          options: ['1 - Poor', '2', '3', '4', '5 - Excellent']
        },
      },
      facilitator: {
        'sampleFacilitatorText' => {
          text: 'How was the facilitator?',
          answer_type: ANSWER_TEXT
        },
        'sampleFacilitatorScale' => {
          text: 'How do you rate the facilitators skills?',
          answer_type: ANSWER_SCALE,
          min_value: 1,
          max_value: 5,
          options: ['1 - Weak', '2', '3', '4', '5 - Amazing']
        }
      }
    }

    @expected_questions = {
      'Pre Workshop' => {
        general: {
          'sampleMatrix_0' => {
            text: 'How do you feel about these statements? I am excited for CS Principles',
            answer_type: ANSWER_SINGLE_SELECT,
            options: %w(Strongly\ Agree Agree Neutral Disagree Strongly\ Disagree),
            max_value: 5,
            parent: 'sampleMatrix'
          },
          'sampleMatrix_1' => {
            text: 'How do you feel about these statements? I am prepared for CS Principles',
            answer_type: ANSWER_SINGLE_SELECT,
            options: %w(Strongly\ Agree Agree Neutral Disagree Strongly\ Disagree),
            max_value: 5,
            parent: 'sampleMatrix'
          },
          'sampleScale' => {
            text: 'Do you like CS Principles?',
            answer_type: ANSWER_SCALE,
            min_value: 1,
            max_value: 5,
            options: ['1 - Strongly Agree', '2', '3', '4', '5 - Strongly Disagree']
          },
          'sampleText' => {
            text: 'Write some thoughts here',
            answer_type: ANSWER_TEXT
          }
        }
      },
      'Day 1' => expected_daily_questions,
      'Day 2' => expected_daily_questions,
      'Day 3' => expected_daily_questions,
      'Day 4' => expected_daily_questions,
      'Day 5' => expected_daily_questions
    }

    @expected_academic_year_questions = {
      'Day 1' => expected_daily_questions,
      'Day 2' => expected_daily_questions,
      'Post Workshop' => {
        general: {
          'samplePostText' => {
            text: 'What is your favorite thing about Computer Science?',
            answer_type: ANSWER_TEXT
          },
          'samplePostScale' => {
            text: 'How excited are you to teach CS?',
            answer_type: ANSWER_SCALE,
            min_value: 1,
            max_value: 5,
            options: ['1 - Meh', '2', '3', '4', '5 - Psyched']
          }
        }
      }
    }
  end

  test 'summarize summarizes teachercons as expected' do
    enrollment_1 = create :pd_enrollment
    enrollment_1.workshop.facilitators << create(:facilitator, name: 'Facilitator Bob')
    hash_1 = build :pd_teachercon_survey_hash
    hash_1[:whoFacilitated] = ['Facilitator Bob']
    hash_1[:thingsFacilitatorDidWell] = {'Facilitator Bob': 'Bob did well'}
    hash_1[:thingsFacilitatorCouldImprove] = {'Facilitator Bob': 'Bob could improve'}
    create :pd_teachercon_survey, pd_enrollment: enrollment_1, form_data: hash_1.to_json

    enrollment_2 = create :pd_enrollment
    enrollment_2.workshop.facilitators << create(:facilitator, name: 'Facilitator Jane')
    hash_2 = build :pd_teachercon_survey_hash
    hash_2[:receivedClearCommunication] = 'Strongly Disagree'
    hash_2[:venueFeedback] = 'more venue feedback'
    hash_2[:howCouldImprove] = 'so much'
    hash_2[:whoFacilitated] = ['Facilitator Jane']
    hash_2[:thingsFacilitatorDidWell] = {'Facilitator Jane': 'Jane did well'}
    hash_2[:thingsFacilitatorCouldImprove] = {'Facilitator Jane': 'Jane could improve'}
    create :pd_teachercon_survey, form_data: hash_2.to_json, pd_enrollment: enrollment_2
    workshops = [enrollment_1.workshop, enrollment_2.workshop]
    workshops.each {|w| w.update(course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_TEACHER_CON)}

    result_hash = summarize_workshop_surveys(workshops: workshops)
    assert_equal 3.5, result_hash[:received_clear_communication]
    assert_equal 2, result_hash[:part_of_community]
    assert_equal ['venue feedback', 'more venue feedback'], result_hash[:venue_feedback]

    assert_equal({'Facilitator Bob' => ['Bob did well'], 'Facilitator Jane' => ['Jane did well']}, result_hash[:things_facilitator_did_well])
    assert_equal({'Facilitator Bob' => ['Bob could improve'], 'Facilitator Jane' => ['Jane could improve']}, result_hash[:things_facilitator_could_improve])

    # When viewing workshop surveys for just Facilitator Bob, expect to only see bob's feedback
    result_hash = summarize_workshop_surveys(workshops: workshops, facilitator_name_filter: 'Facilitator Bob')
    assert_equal ['Bob did well'], result_hash[:things_facilitator_did_well]
    assert_equal ['Bob could improve'], result_hash[:things_facilitator_could_improve]
  end

  test 'summarize summarizes local workshops as expected' do
    enrollment_1 = create :pd_enrollment
    enrollment_1.workshop.facilitators << create(:facilitator, name: 'Facilitator Bert')
    enrollment_1.workshop.facilitators << create(:facilitator, name: 'Facilitator Ernie')
    hash_1 = build :pd_local_summer_workshop_survey_hash
    hash_1[:who_facilitated] = ['Facilitator Bert']
    hash_1[:how_clearly_presented] = {'Facilitator Bert': 'Extremely clearly'}
    hash_1[:how_interesting] = {'Facilitator Bert': 'Extremely interesting'}
    hash_1[:how_often_given_feedback] = {'Facilitator Bert': 'All the time'}
    hash_1[:help_quality] = {'Facilitator Bert': 'Extremely good'}
    hash_1[:how_comfortable_asking_questions] = {'Facilitator Bert': 'Extremely comfortable'}
    hash_1[:how_often_taught_new_things] = {'Facilitator Bert': 'All the time'}
    hash_1[:things_facilitator_did_well] = {'Facilitator Bert': 'Bert was very clean'}
    hash_1[:things_facilitator_could_improve] = {'Facilitator Bert': 'Bert was very strict'}
    create :pd_local_summer_workshop_survey, form_data: hash_1.to_json, pd_enrollment: enrollment_1

    enrollment_2 = create :pd_enrollment
    hash_2 = build :pd_local_summer_workshop_survey_hash
    hash_2[:who_facilitated] = ['Facilitator Ernie']
    hash_2[:how_clearly_presented] = {'Facilitator Ernie': 'Extremely clearly'}
    hash_2[:how_interesting] = {'Facilitator Ernie': 'Extremely interesting'}
    hash_2[:how_often_given_feedback] = {'Facilitator Ernie': 'All the time'}
    hash_2[:help_quality] = {'Facilitator Ernie': 'Extremely good'}
    hash_2[:how_comfortable_asking_questions] = {'Facilitator Ernie': 'Extremely comfortable'}
    hash_2[:how_often_taught_new_things] = {'Facilitator Ernie': 'All the time'}
    hash_2[:things_facilitator_did_well] = {'Facilitator Ernie': 'Ernie was very fun'}
    hash_2[:things_facilitator_could_improve] = {'Facilitator Ernie': 'Ernie did not put down the ducky'}
    create :pd_local_summer_workshop_survey, form_data: hash_2.to_json, pd_enrollment: enrollment_2

    enrollment_3 = create :pd_enrollment
    hash_3 = build :pd_local_summer_workshop_survey_hash
    hash_3[:how_much_learned] = 'A little bit'
    hash_3[:who_facilitated] = ['Facilitator Ernie']
    hash_3[:how_clearly_presented] = {'Facilitator Ernie': 'Not at all clearly'}
    hash_3[:how_interesting] = {'Facilitator Ernie': 'Extremely interesting'}
    hash_3[:how_often_given_feedback] = {'Facilitator Ernie': 'All the time'}
    hash_3[:help_quality] = {'Facilitator Ernie': 'Extremely good'}
    hash_3[:how_comfortable_asking_questions] = {'Facilitator Ernie': 'Extremely comfortable'}
    hash_3[:how_often_taught_new_things] = {'Facilitator Ernie': 'All the time'}
    hash_3[:things_facilitator_did_well] = {'Facilitator Ernie': 'Ernie was a good saxophone player'}
    hash_3[:things_facilitator_could_improve] = {'Facilitator Ernie': 'Ernie was disorganized'}
    create :pd_local_summer_workshop_survey, form_data: hash_3.to_json, pd_enrollment: enrollment_3

    workshops = [enrollment_1.workshop, enrollment_2.workshop, enrollment_3.workshop]
    workshops.each {|w| w.update(course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP)}
    create :pd_enrollment, workshop: workshops.first

    result_hash = summarize_workshop_surveys(workshops: workshops)
    assert_equal 4, result_hash[:num_enrollments]
    assert_equal 3, result_hash[:num_surveys]
    assert_equal 4, result_hash[:how_much_learned]
    assert_equal ['venue feedback', 'venue feedback', 'venue feedback'], result_hash[:venue_feedback]
    assert_equal [['Facilitator Bert'], ['Facilitator Ernie'], ['Facilitator Ernie']], result_hash[:who_facilitated]
    assert_equal({'Facilitator Bert' => 5.0, 'Facilitator Ernie' => 3.0}, result_hash[:how_clearly_presented])
    assert_equal({'Facilitator Bert' => ['Bert was very strict'], 'Facilitator Ernie' => ['Ernie did not put down the ducky', 'Ernie was disorganized']}, result_hash[:things_facilitator_could_improve])

    result_hash = summarize_workshop_surveys(workshops: workshops, facilitator_name_filter: 'Facilitator Ernie')
    assert_equal 4.0, result_hash[:how_much_learned]
    assert_equal ['venue feedback', 'venue feedback', 'venue feedback'], result_hash[:venue_feedback]
    assert_equal [['Facilitator Bert'], ['Facilitator Ernie'], ['Facilitator Ernie']], result_hash[:who_facilitated]
    assert_equal 3.0, result_hash[:how_clearly_presented]
    assert_equal ['Ernie did not put down the ducky', 'Ernie was disorganized'], result_hash[:things_facilitator_could_improve]

    result_hash = summarize_workshop_surveys(workshops: workshops, facilitator_breakdown: false)
    assert_equal 3.67, result_hash[:how_clearly_presented]

    result_hash = summarize_workshop_surveys(workshops: workshops, facilitator_breakdown: false, include_free_response: false)
    assert_nil result_hash[:things_facilitator_did_well]
  end

  test 'averaging across multiple surveys' do
    workshop_1 = create :summer_workshop, num_sessions: 1, num_facilitators: 2, num_completed_surveys: 5
    workshop_2 = create :summer_workshop, num_sessions: 1, num_facilitators: 3, num_completed_surveys: 10

    workshop_2.survey_responses.each do |response|
      response.update_form_data_hash(
        {
          how_clearly_presented: {
            workshop_2.facilitators.first.name => 'Not at all clearly',
            workshop_2.facilitators.second.name => 'Not at all clearly',
            workshop_2.facilitators.third.name => 'Not at all clearly'
          }
        }
      )
      response.save
    end

    # With 10 people saying "Not at all clearly" to 3 facilitators, and 5 people saying
    # "Extremely Clearly" to 2 facilitators, we'd expect the answer to be
    # [(10 * 3 * 1) + (5 * 2 * 5)] / (10 + 30) = 2
    result_hash = summarize_workshop_surveys(workshops: [workshop_1, workshop_2], facilitator_breakdown: false)
    assert_equal 2, result_hash[:how_clearly_presented]
  end

  test 'get an error if summarizing a mix of workshop surveys' do
    local_workshop = create(:pd_local_summer_workshop_survey).pd_enrollment.workshop
    local_workshop.update(course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP)

    teachercon = create(:pd_teachercon_survey).pd_enrollment.workshop
    teachercon.update(course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_TEACHER_CON)
    assert_raise RuntimeError do
      summarize_workshop_surveys(workshops: [local_workshop, teachercon])
    end
  end

  test 'daily survey get_question_for_forms gets workshop questions and substitutes question texts' do
    CDO.expects(:jotform_forms).times(22).returns( # 12 for general, 10 for facilitator
      {
        'local_summer' => {
          'day_0' => FORM_IDS[:summer][:pre_workshop],
          'day_1' => FORM_IDS[:summer][:day_1],
          'day_2' => FORM_IDS[:summer][:day_2],
          'day_3' => FORM_IDS[:summer][:day_3],
          'day_4' => FORM_IDS[:summer][:day_4],
          'day_5' => FORM_IDS[:summer][:day_5],
          'facilitator' => FORM_IDS[:summer][:facilitator]
        }
      }
    )

    assert_equal(@expected_questions, get_questions_for_forms(@workshop))
  end

  test 'daily survey get_questions_for_forms gets academic year workshop questions' do
    CDO.expects(:jotform_forms).times(10).returns(
      {
        'academic_year_1_2' => {
          'day_1' => FORM_IDS[:academic_year_1_2][:day_1],
          'day_2' => FORM_IDS[:academic_year_1_2][:day_1],
          'facilitator' => FORM_IDS[:academic_year_1_2][:facilitator],
          'post_workshop' => FORM_IDS[:academic_year_1_2][:post_workshop]
        }
      }
    )

    assert_equal(@expected_academic_year_questions, get_questions_for_forms(@academic_year_workshop))
  end

  test 'generate workshop survey summary works as expected' do
    CDO.stubs(:jotform_forms).returns(
      {
        'local_summer' => {
          'day_0' => FORM_IDS[:summer][:pre_workshop],
          'day_1' => FORM_IDS[:summer][:day_1],
          'day_2' => FORM_IDS[:summer][:day_2],
          'day_3' => FORM_IDS[:summer][:day_3],
          'day_4' => FORM_IDS[:summer][:day_4],
          'day_5' => FORM_IDS[:summer][:day_5],
          'facilitator' => FORM_IDS[:summer][:facilitator]
        }
      }
    )

    common_survey_hash = {
      form_id: CDO.jotform_forms['local_summer']['day_0'],
      pd_workshop: @workshop,
      day: 0
    }

    Pd::WorkshopDailySurvey.create(
      common_survey_hash.merge(
        {
          submission_id: (Pd::WorkshopDailySurvey.maximum(:id) || 0) + 1,
          user: create(:teacher),
          answers: {
            '1' => {
              'I am excited for {workshopCourse}' => 'Strongly Agree',
              'I am prepared for {workshopCourse}' => 'Agree'
            },
            '2' => '4',
            '3' => 'Here are my thoughts'
          }.to_json
        }
      )
    ).save(validate: false)

    Pd::WorkshopDailySurvey.create(
      common_survey_hash.merge(
        {
          submission_id: (Pd::WorkshopDailySurvey.maximum(:id) || 0) + 1,
          user: create(:teacher),
          answers: {
            '1' => {
              'I am excited for {workshopCourse}' => 'Disagree',
              'I am prepared for {workshopCourse}' => 'Agree'
            },
            '2' => '2',
            '3' => 'More thoughts'
          }.to_json
        }
      )
    ).save(validate: false)

    Pd::WorkshopDailySurvey.create(
      common_survey_hash.merge(
        {
          submission_id: (Pd::WorkshopDailySurvey.maximum(:id) || 0) + 1,
          user: create(:teacher),
          answers: {
            '1' => {
              'I am excited for {workshopCourse}' => 'Strongly Agree',
              'I am prepared for {workshopCourse}' => 'Agree'
            }
          }.to_json
        }
      )
    ).save(validate: false)

    2.times do
      Pd::WorkshopFacilitatorDailySurvey.create(
        common_survey_hash.merge(
          pd_session_id: @workshop.sessions.first.id,
          form_id: CDO.jotform_forms['local_summer']['facilitator'],
          day: 1,
          facilitator_id: @workshop.facilitators.first.id,
          user: create(:teacher),
          submission_id: (Pd::WorkshopFacilitatorDailySurvey.maximum(:id) || 0) + 1,
          answers: {
            '1' => 'Great!',
            '2' => '4',
            '3' => @workshop.facilitators.first.id
          }.to_json
        )
      )
    end

    Pd::WorkshopFacilitatorDailySurvey.create(
      common_survey_hash.merge(
        pd_session_id: @workshop.sessions.first.id,
        form_id: CDO.jotform_forms['local_summer']['facilitator'],
        day: 1,
        facilitator_id: @workshop.facilitators.first.id,
        user: create(:teacher),
        submission_id: (Pd::WorkshopFacilitatorDailySurvey.maximum(:id) || 0) + 1,
        answers: {
          '1' => 'Pretty good!',
          '2' => '3',
          '3' => @workshop.facilitators.first.id
        }.to_json
      )
    )

    2.times do
      Pd::WorkshopFacilitatorDailySurvey.create(
        common_survey_hash.merge(
          pd_session_id: @workshop.sessions.first.id,
          form_id: CDO.jotform_forms['local_summer']['facilitator'],
          day: 1,
          facilitator_id: @workshop.facilitators.second.id,
          user: create(:teacher),
          submission_id: (Pd::WorkshopFacilitatorDailySurvey.maximum(:id) || 0) + 1,
          answers: {
            '1' => 'Bad!',
            '2' => '2',
            '3' => @workshop.facilitators.second.id
          }.to_json
        )
      )
    end

    Pd::WorkshopFacilitatorDailySurvey.create(
      common_survey_hash.merge(
        pd_session_id: @workshop.sessions.first.id,
        form_id: CDO.jotform_forms['local_summer']['facilitator'],
        day: 1,
        facilitator_id: @workshop.facilitators.second.id,
        user: create(:teacher),
        submission_id: (Pd::WorkshopFacilitatorDailySurvey.maximum(:id) || 0) + 1,
        answers: {
          '1' => 'Okay!',
          '2' => '3',
          '3' => @workshop.facilitators.second.id
        }.to_json
      )
    )

    daily_expected_results = {
      response_count: 0,
      general: {
        'sampleDailyScale' => {}
      },
      facilitator: {
        'sampleFacilitatorText' => {},
        'sampleFacilitatorScale' => {}
      }
    }

    all_expected_results = {
      'Pre Workshop' => {
        response_count: 3,
        general: {
          'sampleMatrix_0' => {
            'Strongly Agree' => 2,
            'Disagree' => 1,
            'num_respondents' => 3
          },
          'sampleMatrix_1' => {
            'Agree' => 3,
            'num_respondents' => 3
          },
          'sampleScale' => {
            2 => 1,
            4 => 1,
            'num_respondents' => 2
          },
          'sampleText' => ['Here are my thoughts', 'More thoughts']
        }
      },
      'Day 1' => {
        response_count: 0,
        general: {
          'sampleDailyScale' => {},
        },
        facilitator: {
          'sampleFacilitatorText' => {
            @workshop.facilitators.first.name => ['Great!', 'Great!', 'Pretty good!'],
            @workshop.facilitators.second.name => ['Bad!', 'Bad!', 'Okay!']
          },
          'sampleFacilitatorScale' => {
            @workshop.facilitators.first.name => {4 => 2, 3 => 1},
            @workshop.facilitators.second.name => {3 => 1, 2 => 2}
          }
        }
      },
      'Day 2' => daily_expected_results,
      'Day 3' => daily_expected_results,
      'Day 4' => daily_expected_results,
      'Day 5' => daily_expected_results
    }

    assert_equal(all_expected_results, generate_workshops_survey_summary([@workshop], @expected_questions))

    stubs(:current_user).returns @workshop.facilitators.first

    first_facilitator_expected_results = all_expected_results.deep_dup
    first_facilitator_expected_results['Day 1'][:facilitator]['sampleFacilitatorText'].delete @workshop.facilitators.second.name
    first_facilitator_expected_results['Day 1'][:facilitator]['sampleFacilitatorScale'].delete @workshop.facilitators.second.name
    assert_equal(first_facilitator_expected_results, generate_workshops_survey_summary([@workshop], @expected_questions))
  end

  test 'test get_session_summary' do
    # The survey results for this session.
    survey_for_session =
      [{"type_of_last_pd" =>
         ["I completed an online course/webinar.",
          "I participated in a professional learning community/lesson study/teacher study group.",
          "I received assistance or feedback from a formally designated coach/mentor.",
          "I took a formal course for college credit."],
        "reasons_for_no_PD" => ["Did not have school/admin support", "my other text"],
        "wouldYou220" => "No, thanks.",
        "permission" => "No, I do not give permission to quote me."},
       {"type_of_last_pd" =>
         ["I completed an online course/webinar.",
          "I participated in a professional learning community/lesson study/teacher study group.",
          "I received assistance or feedback from a formally designated coach/mentor."],
        "reasons_for_no_PD" => ["Did not have financial support", "second other text"],
        "wouldYou220" => "No, thanks.",
        "permission" => "No, I do not give permission to quote me."}]

    # A multi-choice question.

    expected_result =
      {"I completed an online course/webinar." => 2,
       "I participated in a professional learning community/lesson study/teacher study group." => 2,
       "I received assistance or feedback from a formally designated coach/mentor." => 2,
       "I took a formal course for college credit." => 1,
       "num_respondents" => 2}

    result = get_session_summary(survey_for_session, "type_of_last_pd")
    assert_equal(result, expected_result)

    # A multi-choice question with Other response containing free text.

    expected_result =
      {"Did not have school/admin support" => 1,
       "my other text" => 1,
       "Did not have financial support" => 1,
       "second other text" => 1,
       "num_respondents" => 2}

    result = get_session_summary(survey_for_session, "reasons_for_no_PD")
    assert_equal(result, expected_result)

    # A question that wasn't answered by any users.

    result = get_session_summary(survey_for_session, "pd_activities_0")
    assert_equal(result, {})

    # A single-choice question.

    expected_result =
      {"No, I do not give permission to quote me." => 2, "num_respondents" => 2}

    result = get_session_summary(survey_for_session, "permission")
    assert_equal(result, expected_result)
  end

  test 'generate facilitator averages works off provided summary data' do
    existing_summary = summary_before_calculating_facilitator_averages

    generate_facilitator_averages(existing_summary)

    assert_equal(
      {
        'Facilitator Person 1' => {
          'facilitator_effectiveness_0' => {
            this_workshop: 4.0,
            all_my_workshops: 4.0
          },
          'teacher_engagement_0' => {
            this_workshop: 4.0,
            all_my_workshops: 4.0
          },
          'overall_success_0' => {
            this_workshop: 4.0,
            all_my_workshops: 4.0,
          },
          facilitator_effectiveness: {
            this_workshop: 0.67,
            all_my_workshops: 0.67
          },
          teacher_engagement: {
            this_workshop: 1.0,
            all_my_workshops: 1.0,
          },
          overall_success: {
            this_workshop: 0.8,
            all_my_workshops: 0.8
          }
        },
        'Facilitator Person 2' => {
          'facilitator_effectiveness_0' => {
            this_workshop: 4.0,
            all_my_workshops: 4.0
          },
          'teacher_engagement_0' => {
            this_workshop: 4.0,
            all_my_workshops: 4.0
          },
          'overall_success_0' => {
            this_workshop: 4.0,
            all_my_workshops: 4.0,
          },
          facilitator_effectiveness: {
            this_workshop: 0.67,
            all_my_workshops: 0.67
          },
          teacher_engagement: {
            this_workshop: 1.0,
            all_my_workshops: 1.0,
          },
          overall_success: {
            this_workshop: 0.8,
            all_my_workshops: 0.8
          }
        },
        questions: {
          "facilitator_effectiveness_0" => "During my workshop, {facilitatorName} did the following: Demonstrated knowledge of the curriculum.",
          "teacher_engagement_0" => "How much do you agree or disagree with the following statements about your level of engagement in the workshop? I found the activities we did in this workshop interesting and engaging.",
          "overall_success_0" => "How much do you agree or disagree with the following statements about the workshop overall? I feel more prepared to teach the material covered in this workshop than before I came."
        }
      },

      existing_summary[:facilitator_averages]
    )
  end

  # This is testing the edge case where summary[:all_my_workshops] is nil.
  # Previously, this caused a NoMethodError because we tried to add nil values.
  # Facilitators can be in this situation if they have workshop organizer permissions
  # but haven't organized workshops since June 2018.
  test 'generate facilitator averages works as expected when no related workshops' do
    summary = summary_before_calculating_facilitator_averages.merge({all_my_workshops: nil})

    assert_nil summary[:all_my_workshops]

    expected_averages = {
      'Facilitator Person 1' => {
        'facilitator_effectiveness_0' => {
          this_workshop: 4.0,
          all_my_workshops: nil
        },
        'teacher_engagement_0' => {
          this_workshop: 4.0,
          all_my_workshops: nil
        },
        'overall_success_0' => {
          this_workshop: 4.0,
          all_my_workshops: nil
        },
        # these values come from the average response to all questions in the category
        # so, 4 / (category size)
        facilitator_effectiveness: {
          this_workshop: 0.67,
          all_my_workshops: 0.0
        },
        teacher_engagement: {
          this_workshop: 1.0,
          all_my_workshops: 0.0
        },
        overall_success: {
          this_workshop: 0.8,
          all_my_workshops: 0.0
        }
      },
      'Facilitator Person 2' => {
        'facilitator_effectiveness_0' => {
          this_workshop: 4.0,
          all_my_workshops: nil
        },
        'teacher_engagement_0' => {
          this_workshop: 4.0,
          all_my_workshops: nil
        },
        'overall_success_0' => {
          this_workshop: 4.0,
          all_my_workshops: nil
        },
        facilitator_effectiveness: {
          this_workshop: 0.67,
          all_my_workshops: 0.0
        },
        teacher_engagement: {
          this_workshop: 1.0,
          all_my_workshops: 0.0
        },
        overall_success: {
          this_workshop: 0.8,
          all_my_workshops: 0.0
        }
      },
      questions: {
        "facilitator_effectiveness_0" => "During my workshop, {facilitatorName} did the following: Demonstrated knowledge of the curriculum.",
        "teacher_engagement_0" => "How much do you agree or disagree with the following statements about your level of engagement in the workshop? I found the activities we did in this workshop interesting and engaging.",
        "overall_success_0" => "How much do you agree or disagree with the following statements about the workshop overall? I feel more prepared to teach the material covered in this workshop than before I came."
      }
    }

    actual_averages = generate_facilitator_averages(summary)

    assert_equal expected_averages, actual_averages
  end

  def summary_before_calculating_facilitator_averages
    {
      this_workshop: {
        'Day 1' => {
          general: {},
          facilitator: {}
        },
        'Day 2' => {
          general: {
            'teacher_engagement_0' => {
              'Strongly Agree' => 1,
              'Strongly Disagree' => 1,
              'Neutral' => 1,
              'num_respondents' => 3 # This should get filtered out.
            },
            'overall_success_0' => {
              'Strongly Agree' => 1,
              'Strongly Disagree' => 1,
              'Neutral' => 1,
              'num_respondents' => 3
            }
          },
          facilitator: {
            'facilitator_effectiveness_0' => {
              'Facilitator Person 1' => {
                'Strongly Agree' => 1,
                'Strongly Disagree' => 1,
                'Neutral' => 1
              },
              'Facilitator Person 2' => {
                'Strongly Agree' => 1,
                'Strongly Disagree' => 1,
                'Neutral' => 1
              }
            }
          }
        }
      },
      all_my_workshops: {
        'Day 1' => {
          general: {},
          facilitator: {}
        },
        'Day 2' => {
          general: {
            'teacher_engagement_0' => {
              'Strongly Agree' => 1,
              'Strongly Disagree' => 1,
              'Neutral' => 1,
              'num_respondents' => 3
            },
            'overall_success_0' => {
              'Strongly Agree' => 1,
              'Strongly Disagree' => 1,
              'Neutral' => 1,
              'num_respondents' => 3
            },
          },
          facilitator: {
            'facilitator_effectiveness_0' => {
              'Facilitator Person 1' => {
                'Strongly Agree' => 1,
                'Strongly Disagree' => 1,
                'Neutral' => 1
              },
              'Facilitator Person 2' => {
                'Strongly Agree' => 1,
                'Strongly Disagree' => 1,
                'Neutral' => 1
              }
            }
          }
        },
      },
      questions: {
        'Day 1' => {
          general: {},
          facilitator: {}
        },
        'Day 2' => {
          general: {
            'teacher_engagement_0' => {
              text: 'How much do you agree or disagree with the following statements about your level of engagement in the workshop? I found the activities we did in this workshop interesting and engaging.',
              answer_type: 'singleSelect',
              options: [
                'Strongly Disagree',
                'Disagree',
                'Slightly Disagree',
                'Neutral',
                'Slightly Agree',
                'Agree',
                'Strongly Agree'
              ]
            },
            'overall_success_0' => {
              text: 'How much do you agree or disagree with the following statements about the workshop overall? I feel more prepared to teach the material covered in this workshop than before I came.',
              answer_type: 'singleSelect',
              options: [
                'Strongly Disagree',
                'Disagree',
                'Slightly Disagree',
                'Neutral',
                'Slightly Agree',
                'Agree',
                'Strongly Agree'
              ]
            }
          },
          facilitator: {
            'facilitator_effectiveness_0' => {
              text: 'During my workshop, {facilitatorName} did the following: Demonstrated knowledge of the curriculum.',
              options: [
                'Strongly Disagree',
                'Disagree',
                'Slightly Disagree',
                'Neutral',
                'Slightly Agree',
                'Agree',
                'Strongly Agree'
              ]
            }
          }
        }
      },
      facilitators: @workshop.facilitators.map {|f| [f.id, f.name]}.to_h
    }
  end

  # Regression test:
  # We ran into an error when a regional partner with permission to see many related workshops
  # tried to view a report on a workshop where the facilitator was not present in the related
  # workshops.
  test 'generate facilitator averages when related workshops have different facilitators' do
    summary = regression_test_summary_without_facilitator_overlap

    expected_averages = {
      "Vladimir" => {
        "facilitator_effectiveness_0" => {this_workshop: 4.0, all_my_workshops: nil},
        "overall_success_0" => {this_workshop: 4.0, all_my_workshops: 6.4},
        facilitator_effectiveness: {this_workshop: 0.67, all_my_workshops: 0.0},
        teacher_engagement: {this_workshop: 0.0, all_my_workshops: 0.0},
        overall_success: {this_workshop: 0.8, all_my_workshops: 1.28}
      },
      questions: {
        "facilitator_effectiveness_0" => "During my workshop, {facilitatorName} did the following: Demonstrated knowledge of the curriculum.",
        "overall_success_0" => "How much do you agree or disagree with the following statements about the workshop overall? I feel more prepared to teach the material covered in this workshop than before I came."
      }
    }

    actual_averages = generate_facilitator_averages(summary)

    assert_equal expected_averages, actual_averages
  end

  # Regression test fixture generated by pulling a known failing case from production,
  # scrubbing PII, and pruning down to a more-or-less minimum repro case.
  # There's a lot here, but the salient point is that the facilitator Vladimir, listed in the
  # :facilitators section of this summary is _not found_ in the :all_my_workshops
  # section (where we see Estragon and Pozzo instead).
  def regression_test_summary_without_facilitator_overlap
    {
      this_workshop: {
        "Day 5" => {
          response_count: 0,
          general: {
            "overall_success_0" => {
              'Strongly Agree' => 1,
              'Strongly Disagree' => 1,
              'Neutral' => 1,
              'num_respondents' => 3
            },
          },
          facilitator: {
            "facilitator_effectiveness_0" => {
              'Vladimir' => {
                'Strongly Agree' => 1,
                'Strongly Disagree' => 1,
                'Neutral' => 1
              }
            }
          }
        }
      },
      course_name: "CS Principles",
      questions: {
        "Day 5" => {
          general: {
            "overall_success_0" => {
              parent: "overall_success",
              max_value: 7,
              text: "How much do you agree or disagree with the following statements about the workshop overall? I feel more prepared to teach the material covered in this workshop than before I came.",
              answer_type: "singleSelect",
              options: ["Strongly Disagree", "Disagree", "Slightly Disagree", "Neutral", "Slightly Agree", "Agree", "Strongly Agree"],
              option_map: {"Strongly Disagree" => 1, "Disagree" => 2, "Slightly Disagree" => 3, "Neutral" => 4, "Slightly Agree" => 5, "Agree" => 6, "Strongly Agree" => 7}
            }
          },
          facilitator: {
            "facilitator_effectiveness_0" => {
              parent: "facilitator_effectiveness",
              max_value: 7,
              text: "During my workshop, {facilitatorName} did the following: Demonstrated knowledge of the curriculum.",
              answer_type: "singleSelect",
              options: ["Strongly Disagree", "Disagree", "Slightly Disagree", "Neutral", "Slightly Agree", "Agree", "Strongly Agree"],
              option_map: {"Strongly Disagree" => 1, "Disagree" => 2, "Slightly Disagree" => 3, "Neutral" => 4, "Slightly Agree" => 5, "Agree" => 6, "Strongly Agree" => 7}
            },
          }
        }
      },
      facilitators: {22_878_716 => "Vladimir"},
      all_my_workshops: {
        "Day 5" => {
          response_count: 15,
          general: {
            "overall_success_0" => {"Strongly Agree" => 6, "Agree" => 9, "num_respondents" => 15},
          },
          facilitator: {
            "facilitator_effectiveness_0" => {
              "Estragon" => {"Strongly Agree" => 6, "Agree" => 8},
              "Pozzo" => {"Agree" => 8, "Slightly Agree" => 6}
            },
          }
        }
      }
    }
  end
end
