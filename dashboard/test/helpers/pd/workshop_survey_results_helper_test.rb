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
    facilitator_1 = create :facilitator, name: 'Facilitator Person 1'
    facilitator_2 = create :facilitator, name: 'Facilitator Person 2'
    @workshop = create :pd_workshop, :local_summer_workshop, course: COURSE_CSP, facilitators: [facilitator_1, facilitator_2], num_sessions: 5
    @academic_year_workshop = create :pd_workshop, course: COURSE_CSP, subject: SUBJECT_CSP_WORKSHOP_5, num_facilitators: 2, num_sessions: 2

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
    workshop_1 = create(:pd_workshop, :local_summer_workshop, num_sessions: 1, num_facilitators: 2, num_completed_surveys: 5)
    workshop_2 = create(:pd_workshop, :local_summer_workshop, num_sessions: 1, num_facilitators: 3, num_completed_surveys: 10)

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
            'Disagree' => 1
          },
          'sampleMatrix_1' => {
            'Agree' => 3,
          },
          'sampleScale' => {
            2 => 1,
            4 => 1
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

  test 'generate facilitator averages works off provided summary data' do
    existing_summary = {
      this_workshop: {
        'Day 1' => {
          general: {
            'overallHow' => {
              'A tremendous amount' => 5,
              'Quite a bit' => 3,
              'Some' => 1
            }
          },
          facilitator: {
            'howOften56' => {
              'Facilitator Person 1' => {
                'All the time' => 5,
                'Often' => 1
              },
              'Facilitator Person 2' => {
                'Sometimes' => 5,
                'Almost never' => 2
              }
            }
          }
        },
        'Day 2' => {
          general: {
            'iFeel133' => {
              'Fantastic' => 5,
              'Pretty good' => 3
            },
            'overallHow' => {
              'A tremendous amount' => 5
            }
          },
          facilitator: {
            'howOften56' => {
              'Facilitator Person 1' => {
                'All the time' => 4,
                'Often' => 2
              },
              'Facilitator Person 2' => {
                'Sometimes' => 3,
                'Almost never' => 5
              }
            }
          }
        },
      },
      all_my_workshops: {
        'Day 1' => {
          general: {
            'overallHow' => {
              'A tremendous amount' => 10,
              'Quite a bit' => 9,
              'Some' => 8,
              'A little bit' => 7,
              'Almost nothing' => 1
            }
          },
          facilitator: {
            'howOften56' => {
              'Facilitator Person 1' => {
                'All the time' => 5,
                'Often' => 4,
                'Sometimes' => 3
              },
              'Facilitator Person 2' => {
                'Sometimes' => 10,
                'Once in a while' => 9,
                'Almost never' => 8
              }
            }
          }
        },
        'Day 2' => {
          general: {
            'overallHow' => {
              'A tremendous amount' => 5,
              'Quite a bit' => 6,
              'Some' => 9,
              'A little bit' => 2,
              'Almost nothing' => 3
            },
            'iFeel133' => {
              'Fantastic' => 10,
              'Pretty good' => 5,
              'So-so' => 1
            }
          },
          facilitator: {
            'howOften56' => {
              'Facilitator Person 1' => {
                'All the time' => 10,
                'Often' => 6,
                'Sometimes' => 5
              },
              'Facilitator Person 2' => {
                'Often' => 1,
                'Sometimes' => 10,
                'Once in a while' => 20,
                'Almost never' => 15
              }
            }
          }
        },
      },
      questions: {
        'Day 1' => {
          general: {
            'overallHow' => {
              text: 'Overall how much did you learn from this course?',
              answer_type: 'singleSelect',
              options: [
                'Almost nothing',
                'A little bit',
                'Some',
                'Quite a bit',
                'A tremendous amount'
              ]
            }
          },
          facilitator: {
            'howOften56' => {
              text: 'How often did your facilitator help you?',
              options: [
                'Almost never',
                'Once in a while',
                'Sometimes',
                'Often',
                'All the time'
              ]
            }
          }
        },
        'Day 2' => {
          general: {
            'overallHow' => {
              text: 'Overall how much did you learn from this course?',
              answer_type: 'singleSelect',
              options: [
                'Almost nothing',
                'A little bit',
                'Some',
                'Quite a bit',
                'A tremendous amount'
              ]
            },
            'iFeel133' => {
              text: 'Overall, how do you feel about computer science?',
              answer_type: 'singleSelect',
              options: [
                'Awful',
                'Not great',
                'So-so',
                'Pretty good',
                'Fantastic'
              ]
            }
          },
          facilitator: {
            'howOften56' => {
              text: 'How often did your facilitator help you?',
              options: [
                'Almost never',
                'Once in a while',
                'Sometimes',
                'Often',
                'All the time'
              ]
            }
          }
        }
      },
      facilitators: @workshop.facilitators.map {|f| [f.id, f.name]}.to_h
    }

    generate_facilitator_averages(existing_summary)

    assert_equal(
      {
        'Facilitator Person 1' => {
          'overallHow' => {
            this_workshop: 4.64,
            all_my_workshops: 3.47
          },
          'howOften56' => {
            this_workshop: 4.75,
            all_my_workshops: 4.21
          },
          'iFeel133' => {
            this_workshop: 4.63,
            all_my_workshops: 4.56,
          },
          facilitator_effectiveness: {
            this_workshop: 1.34,
            all_my_workshops: 1.1
          },
          teacher_engagement: {
            this_workshop: 0,
            all_my_workshops: 0,
          },
          overall_success: {
            this_workshop: 0.93,
            all_my_workshops: 0.91
          }
        },
        'Facilitator Person 2' => {
          'overallHow' => {
            this_workshop: 4.64,
            all_my_workshops: 3.47
          },
          'howOften56' => {
            this_workshop: 2.07,
            all_my_workshops: 1.99
          },
          'iFeel133' => {
            this_workshop: 4.63,
            all_my_workshops: 4.56,
          },
          facilitator_effectiveness: {
            this_workshop: 0.96,
            all_my_workshops: 0.78
          },
          teacher_engagement: {
            this_workshop: 0,
            all_my_workshops: 0,
          },
          overall_success: {
            this_workshop: 0.93,
            all_my_workshops: 0.91
          }
        },
        questions: {
          'overallHow' => "Overall how much did you learn from this course?",
          'howOften56' => "How often did your facilitator help you?",
          'iFeel133' => "Overall, how do you feel about computer science?"
        }
      },

      existing_summary[:facilitator_averages]
    )
  end
end
