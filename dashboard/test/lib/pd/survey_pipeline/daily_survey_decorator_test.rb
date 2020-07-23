require 'test_helper'
require 'pd/survey_pipeline/daily_survey_decorator.rb'

module Pd::SurveyPipeline
  class DailySurveyDecoratorTest < ActiveSupport::TestCase
    include Pd::WorkshopConstants

    self.use_transactional_test_case = true
    setup_all do
      @facilitators = create_list :facilitator, 2
      @workshop = create :csf_deep_dive_workshop, facilitators: @facilitators

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
      context_name = 'Facilitators'

      parsed_questions = {
        form_id => {
          '1' => {type: 'radio', name: 'importance', text: 'CS is important?', order: 1,
            options: %w(Disagree Neutral Agree),
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
        {workshop_id: @workshop.id, day: 0, form_id: form_id, facilitator_id: @facilitators.first.id,
          name: 'importance', reducer: 'histogram', reducer_result: {'Agree': 2}},
        {workshop_id: @workshop.id, day: 0, form_id: form_id, facilitator_id: @facilitators.first.id,
          name: 'feedback', reducer: 'no_op', reducer_result: ['Feedback 1', 'Feedback 2']},
        {workshop_id: @workshop.id, day: 0, form_id: form_id, facilitator_id: @facilitators.last.id,
          name: 'importance', reducer: 'histogram', reducer_result: {'Neutral': 1, 'Disagree': 1}},
        {workshop_id: @workshop.id, day: 0, form_id: form_id, facilitator_id: @facilitators.last.id,
          name: 'feedback', reducer: 'no_op', reducer_result: ['Feedback 3']}
      ]

      expected_result = {
        course_name: COURSE_CSF,
        questions: {
          context_name => {
            general: {},
            facilitator: {
              'importance' => parsed_questions[form_id]['1'].except(:name),
              'feedback' => parsed_questions[form_id]['2'].except(:name),
            }
          }
        },
        this_workshop: {
          context_name => {
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
        errors: []
      }

      context = {
        summaries: summary_data,
        parsed_questions: parsed_questions,
        parsed_submissions: parsed_submissions,
        current_user: @workshop_admin
      }

      result = DailySurveyDecorator.decorate_single_workshop context

      assert_equal expected_result, result
    end

    test 'decorate general survey results' do
      form_id = "90066184161150".to_i
      context_name = 'Pre Workshop'

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
        {workshop_id: @workshop.id, day: 0, form_id: form_id, name: 'importance',
          reducer: 'histogram', reducer_result: {'Agree': 2, 'Neutral': 1, 'Disagree': 1}},
        {workshop_id: @workshop.id, day: 0, form_id: form_id, name: 'feedback',
          reducer: 'no_op', reducer_result: ['Feedback 1', 'Feedback 2', 'Feedback 3']}
      ]

      expected_result = {
        course_name: COURSE_CSF,
        questions: {
          context_name => {
            general: {
              'importance' => parsed_questions[form_id]['1'].except(:name),
              'feedback' => parsed_questions[form_id]['2'].except(:name),
            },
            facilitator: {}
          }
        },
        this_workshop: {
          context_name => {
            response_count: 4,
            general: {
              'importance' => {'Agree': 2, 'Neutral': 1, 'Disagree': 1},
              'feedback' => ['Feedback 1', 'Feedback 2', 'Feedback 3']
            },
            facilitator: {}
          }
        },
        errors: []
      }

      context = {
        summaries: summary_data,
        parsed_questions: parsed_questions,
        parsed_submissions: parsed_submissions,
        current_user: @workshop_admin
      }

      result = DailySurveyDecorator.decorate_single_workshop context

      assert_equal expected_result, result
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

      assert_equal true, DailySurveyDecorator.summary_visible_to_user?(user, data[0])
      assert_equal false, DailySurveyDecorator.summary_visible_to_user?(user, data[1])
      assert_equal true, DailySurveyDecorator.summary_visible_to_user?(user, data[2])
    end

    test 'program manager and workshop admin see all facilitator results' do
      data = @summary_data_permission_test
      users = [@program_manager, @workshop_admin]

      users.product(data).each do |user, data_row|
        assert_equal true, DailySurveyDecorator.summary_visible_to_user?(user, data_row)
      end
    end

    test 'get context of CSF survey submissions' do
      facilitator = create :facilitator
      workshop = create :csf_deep_dive_workshop, facilitators: [facilitator]
      form_id = '1122334455'.to_i

      survey_metadata_to_context = {
        # Array<workshop_id, day, facilitator_id, form_id> => context_name
        [workshop.id, 0, facilitator.id, form_id] => 'Facilitators',
        [workshop.id, 0, nil, form_id] => 'Pre Workshop',
        [workshop.id, 1, nil, form_id] => 'Post Workshop',
        [workshop.id, -1, nil, form_id] => 'Invalid',
        [0, 0, facilitator.id, form_id] => 'Invalid'
      }

      survey_metadata_to_context.each do |input, expected_output|
        assert_equal expected_output, DailySurveyDecorator.get_survey_context(*input),
          "Wrong output for input #{input}"
      end
    end

    test 'get context of summer workshop survey submissions' do
      workshop = create :csd_summer_workshop, num_sessions: 1
      facilitator = workshop.facilitators.first
      form_id = '1122334455'.to_i

      survey_metadata_to_context = {
        # Array<workshop_id, day, facilitator_id, form_id> => context_name
        [workshop.id, 0, nil, form_id] => 'Pre Workshop',
        [workshop.id, 1, nil, form_id] => 'Day 1',
        [workshop.id, 1, facilitator.id, form_id] => 'Day 1'
      }

      survey_metadata_to_context.each do |input, expected_output|
        assert_equal expected_output, DailySurveyDecorator.get_survey_context(*input),
          "Wrong output for input #{input}"
      end
    end

    test 'get context of academic year workshop survey submissions' do
      workshop = create :csp_academic_year_workshop
      facilitator = workshop.facilitators.first
      daily_form_id = '1122334455'.to_i
      post_ws_form_id = '82115646319154'.to_i

      survey_metadata_to_context = {
        # Array<workshop_id, day, facilitator_id, form_id> => context_name
        [workshop.id, 0, nil, daily_form_id] => 'Invalid',
        [workshop.id, 1, nil, daily_form_id] => 'Day 1',
        [workshop.id, 1, facilitator.id, daily_form_id] => 'Day 1',
        [workshop.id, 1, nil, post_ws_form_id] => 'Post Workshop',
        [workshop.id, 1, facilitator.id, post_ws_form_id] => 'Post Workshop',
      }

      survey_metadata_to_context.each do |input, expected_output|
        assert_equal expected_output, DailySurveyDecorator.get_survey_context(*input),
          "Wrong output for input #{input}"
      end
    end
  end
end
