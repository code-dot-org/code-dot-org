require 'test_helper'
require 'pd/survey_pipeline/daily_survey_decorator.rb'

module Pd::SurveyPipeline
  class DailySurveyDecoratorTest < ActiveSupport::TestCase
    include Pd::WorkshopConstants

    self.use_transactional_test_case = true
    setup_all do
      @facilitators = create_list :facilitator, 2
      @workshop = create :pd_workshop, course: COURSE_CSF, subject: SUBJECT_CSF_201,
        num_sessions: 1, facilitators: @facilitators

      @program_manager = create :program_manager
      @workshop_admin = create :workshop_admin

      @summary_data_permission_test = [
        {facilitator_id: @facilitators.first.id, reducer: 'avgerage', reducer_result: '1.1'},
        {facilitator_id: @facilitators.last.id, reducer: 'avgerage', reducer_result: '2.2'},
        {facilitator_id: nil, reducer: 'avgerage', reducer_result: '3.3'}
      ]
    end

    test 'decorate facilitator survey results' do
      form_id = "91405279991164".to_i
      form_name = 'Facilitator'

      parsed_questions = {
        form_id => {
          '1' => {type: 'radio', name: 'importance', text: 'CS is important?', order: 1,
            options: ['Disagree', 'Neutral', 'Agree'],
            option_map: {'Disagree': 1, 'Neutral': 2, 'Agree': 3}, answer_type: 'singleSelect'},
          '2' => {type: 'textarea', name: 'feedback', text: 'Free-format feedback', order: 2,
            answer_type: 'text'}
        }
      }

      parsed_submissions = {
        form_id => {
          1 => {workshop_id: @workshop.id, user_id: 1, facilitator_id: @facilitators.first.id,
            answers: {'1' => 'Agree', '2' => 'Feedback 1'}},
          2 => {workshop_id: @workshop.id, user_id: 1, facilitator_id: @facilitators.last.id,
            answers: {'1' => 'Agree', '2' => 'Feedback 2'}},
          3 => {workshop_id: @workshop.id, user_id: 2, facilitator_id: @facilitators.first.id,
            answers: {'1' => 'Neutral', '2' => 'Feedback 3'}},
          4 => {workshop_id: @workshop.id, user_id: 2, facilitator_id: @facilitators.last.id,
            answers: {'1' => 'Disagree', '2' => ''}},
        }
      }

      summary_data = [
        {workshop_id: @workshop.id, form_id: form_id, facilitator_id: @facilitators.first.id,
          name: 'importance', reducer: 'histogram', reducer_result: {'Agree': 2}},
        {workshop_id: @workshop.id, form_id: form_id, facilitator_id: @facilitators.first.id,
          name: 'feedback', reducer: 'no_op', reducer_result: ['Feedback 1', 'Feedback 2']},
        {workshop_id: @workshop.id, form_id: form_id, facilitator_id: @facilitators.last.id,
          name: 'importance', reducer: 'histogram', reducer_result: {'Neutral': 1, 'Disagree': 1}},
        {workshop_id: @workshop.id, form_id: form_id, facilitator_id: @facilitators.last.id,
          name: 'feedback', reducer: 'no_op', reducer_result: ['Feedback 3']}
      ]

      expected_result = {
        course_name: COURSE_CSF,
        questions: {
          form_name => {
            general: {},
            facilitator: {
              'importance' => parsed_questions[form_id]['1'].except(:name),
              'feedback' => parsed_questions[form_id]['2'].except(:name),
            }
          }
        },
        this_workshop: {
          form_name => {
            response_count: 4,
            general: {},
            facilitator: {
              'importance' => {
                @facilitators.first.name => {'Agree': 2},
                @facilitators.last.name => {'Neutral': 1, 'Disagree': 1}
              },
              'feedback' => {
                @facilitators.first.name => ['Feedback 1', 'Feedback 2'],
                @facilitators.last.name => ['Feedback 3']
              }
            }
          }
        },
        all_my_workshops: {},
        facilitators: {},
        facilitator_averages: {},
        facilitator_response_counts: {},
        errors: []
      }

      context = {
        summaries: summary_data,
        parsed_questions: parsed_questions,
        parsed_submissions: parsed_submissions,
        current_user: @workshop_admin
      }

      DailySurveyDecorator.process_data context

      assert_equal expected_result, context[:decorated_summaries]
    end

    test 'decorate general survey results' do
      form_id = "90066184161150".to_i
      form_name = 'Pre Workshop'

      parsed_questions = {
        form_id => {
          '1' => {type: 'radio', name: 'importance', text: 'CS is important?', order: 1,
            options: ['Disagree', 'Neutral', 'Agree'],
            option_map: {'Disagree': 1, 'Neutral': 2, 'Agree': 3}, answer_type: 'singleSelect'},
          '2' => {type: 'textarea', name: 'feedback', text: 'Free-format feedback', order: 2,
            answer_type: 'text'}
        }
      }

      parsed_submissions = {
        form_id => {
          1 => {workshop_id: @workshop.id, user_id: 1, answers: {'1' => 'Agree', '2' => 'Feedback 1'}},
          2 => {workshop_id: @workshop.id, user_id: 2, answers: {'1' => 'Agree', '2' => 'Feedback 2'}},
          3 => {workshop_id: @workshop.id, user_id: 3, answers: {'1' => 'Neutral', '2' => 'Feedback 3'}},
          4 => {workshop_id: @workshop.id, user_id: 4, answers: {'1' => 'Disagree', '2' => ''}},
        }
      }

      summary_data = [
        {workshop_id: @workshop.id, form_id: form_id, name: 'importance',
          reducer: 'histogram', reducer_result: {'Agree': 2, 'Neutral': 1, 'Disagree': 1}},
        {workshop_id: @workshop.id, form_id: form_id, name: 'feedback',
          reducer: 'no_op', reducer_result: ['Feedback 1', 'Feedback 2', 'Feedback 3']}
      ]

      expected_result = {
        course_name: COURSE_CSF,
        questions: {
          form_name => {
            general: {
              'importance' => parsed_questions[form_id]['1'].except(:name),
              'feedback' => parsed_questions[form_id]['2'].except(:name),
            },
            facilitator: {}
          }
        },
        this_workshop: {
          form_name => {
            response_count: 4,
            general: {
              'importance' => {'Agree': 2, 'Neutral': 1, 'Disagree': 1},
              'feedback' => ['Feedback 1', 'Feedback 2', 'Feedback 3']
            },
            facilitator: {}
          }
        },
        all_my_workshops: {},
        facilitators: {},
        facilitator_averages: {},
        facilitator_response_counts: {},
        errors: []
      }

      context = {
        summaries: summary_data,
        parsed_questions: parsed_questions,
        parsed_submissions: parsed_submissions,
        current_user: @workshop_admin
      }

      DailySurveyDecorator.process_data context

      assert_equal expected_result, context[:decorated_summaries]
    end

    test 'index questions by form ids and question names' do
      form_ids = %w(90066184161150 90065524560150).map(&:to_i)

      questions = {
        form_ids.first => {
          '1' => {name: 'importance', type: 'radio'},
          '2' => {name: 'feedback', type: 'textarea'}
        },
        form_ids.last => {
          '3' => {name: 'complex', type: 'matrix'},
          '4' => {name: 'rating', type: 'scale'}
        }
      }

      expected_result = {
        form_ids.first => {
          'importance' => {type: 'radio'},
          'feedback' => {type: 'textarea'}
        },
        form_ids.last => {
          'complex' => {type: 'matrix'},
          'rating' => {type: 'scale'}
        }
      }

      result = DailySurveyDecorator.index_question_by_names(questions)

      assert_equal expected_result, result
    end

    test 'facilitator cannot see other facilitator results' do
      data = @summary_data_permission_test
      user = @facilitators.first

      assert_equal true, DailySurveyDecorator.data_visible_to_user?(user, data[0])
      assert_equal false, DailySurveyDecorator.data_visible_to_user?(user, data[1])
      assert_equal true, DailySurveyDecorator.data_visible_to_user?(user, data[2])
    end

    test 'program mamager and workshop admin see all facilitator results' do
      data = @summary_data_permission_test
      users = [@program_manager, @workshop_admin]

      users.product(data).each do |user, data_row|
        assert_equal true, DailySurveyDecorator.data_visible_to_user?(user, data_row)
      end
    end
  end
end
