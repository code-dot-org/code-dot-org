require 'test_helper'

module Pd::Foorm
  class RollupCreatorTest < ActiveSupport::TestCase
    self.use_transactional_test_case = true

    setup_all do
      @summer_post_survey = create :foorm_form_summer_post_survey
      @summer_pre_survey = create :foorm_form_csf_intro_post_survey
    end

    teardown_all do
      @summer_post_survey.delete
      @summer_pre_survey.delete
    end

    test 'creates correct general rollup' do
      setup_csd_workshop
      rollup = RollupCreator.calculate_averaged_rollup(
        @summarized_answers,
        @question_details,
        {},
        split_by_facilitator: false
      )
      expected_rollup = {
        general: {
          response_count: 2,
          averages: {
            teacher_engagement: {
              average: 4,
              rows: {
                activities_engaging: 4,
                participated: 4,
                frequently_talk_about: 4,
                planning_to_use: 4
              }
            },
            overall_success: {
              average: 4,
              rows: {
                more_prepared: 4,
                know_help: 4,
                pd_suitable_experience: 4,
                connected_community: 4,
                would_recommend: 4,
                absolute_best_pd: 4
              }
            },
            expertise_rating: 3
          }
        }
      }

      assert_equal expected_rollup.with_indifferent_access, rollup.with_indifferent_access
    end

    test 'creates correct facilitator rollup' do
      setup_csf_workshop
      rollup = RollupCreator.
        calculate_averaged_rollup(
          @summarized_answers,
          @question_details,
          @facilitators,
          split_by_facilitator: true
        ).with_indifferent_access

      rollup_at_facilitator = rollup[:facilitator][@facilitator_id]
      assert_equal 4, rollup_at_facilitator[:response_count]
      assert_equal 5, rollup[:general][:response_count]
      assert_equal 5.5, rollup_at_facilitator[:averages][:facilitator_effectiveness][:rows][:productive_discussions]
    end

    test 'calculates general intermediate rollup correctly' do
      setup_csd_workshop
      intermediate_rollup = RollupCreator.get_intermediate_rollup(
        @summarized_answers,
        @question_details[:general],
        :general,
        false,
        @facilitators
      )

      expected_rollup = {
        response_count: 2,
        questions: {
          teacher_engagement: {
            activities_engaging: {sum: 8, count: 2},
            participated: {sum: 8, count: 2},
            frequently_talk_about: {sum: 8, count: 2},
            planning_to_use: {sum: 8, count: 2}
          },
          overall_success: {
            more_prepared: {sum: 8, count: 2},
            know_help: {sum: 8, count: 2},
            pd_suitable_experience: {sum: 8, count: 2},
            connected_community: {sum: 8, count: 2},
            would_recommend: {sum: 8, count: 2},
            absolute_best_pd: {sum: 8, count: 2}
          },
          expertise_rating: {sum: 6, count: 2}
        }
      }

      assert_equal expected_rollup.with_indifferent_access, intermediate_rollup.with_indifferent_access
    end

    test 'calculates per-facilitator intermediate rollup correctly' do
      setup_csf_workshop
      intermediate_rollup = RollupCreator.get_intermediate_rollup(
        @summarized_answers,
        @question_details[:facilitator],
        :facilitator,
        true,
        @facilitators
      ).with_indifferent_access

      intermediate_rollup_facilitator = intermediate_rollup[@facilitator_id]
      assert_equal 4, intermediate_rollup_facilitator[:response_count]
      expected_data = {sum: 22, count: 4}.with_indifferent_access
      assert_equal expected_data, intermediate_rollup_facilitator[:questions][:facilitator_effectiveness][:productive_discussions]
    end

    def setup_csd_workshop
      rollup_configuration = JSON.parse(File.read('test/fixtures/rollup_config.json'), symbolize_names: true)
      questions_to_summarize = rollup_configuration['CS Discoveries'.to_sym]
      workshop = create :csd_summer_workshop
      create :day_5_workshop_foorm_submission, :answers_low, pd_workshop_id: workshop.id
      create :day_5_workshop_foorm_submission, :answers_high, pd_workshop_id: workshop.id
      ws_submissions, foorm_submissions, forms = SurveyReporter.get_raw_data_for_workshop(workshop.id)
      parsed_forms = FoormParser.parse_forms(forms)
      @summarized_answers = WorkshopSummarizer.summarize_answers_by_survey(foorm_submissions, parsed_forms, ws_submissions)
      @question_details = RollupHelper.get_question_details_for_rollup(parsed_forms, questions_to_summarize)
    end

    def setup_csf_workshop
      rollup_configuration = JSON.parse(File.read('test/fixtures/rollup_config.json'), symbolize_names: true)
      questions_to_summarize = rollup_configuration['CS Fundamentals'.to_sym]
      workshop = create :csf_workshop
      @facilitator_id = workshop.facilitators.pluck(:id).first
      @facilitators = {@facilitator_id => "name"}
      create :csf_intro_post_facilitator_workshop_submission,
        :answers_low,
        pd_workshop_id: workshop.id,
        facilitator_id: @facilitator_id
      create_list :csf_intro_post_facilitator_workshop_submission,
        3,
        :answers_high,
        pd_workshop_id: workshop.id,
        facilitator_id: @facilitator_id
      create_list :csf_intro_post_workshop_submission, 2, :answers_low, pd_workshop_id: workshop.id
      create_list :csf_intro_post_workshop_submission, 3, :answers_high, pd_workshop_id: workshop.id
      ws_submissions, foorm_submissions, forms = SurveyReporter.get_raw_data_for_workshop(workshop.id)
      parsed_forms = FoormParser.parse_forms(forms)
      @summarized_answers = WorkshopSummarizer.summarize_answers_by_survey(foorm_submissions, parsed_forms, ws_submissions)
      @question_details = RollupHelper.get_question_details_for_rollup(parsed_forms, questions_to_summarize)
    end
  end
end
