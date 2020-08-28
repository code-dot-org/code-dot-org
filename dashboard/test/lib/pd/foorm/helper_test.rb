require 'test_helper'

module Pd::Foorm
  class HelperTest < ActiveSupport::TestCase
    include Helper

    self.use_transactional_test_case = true

    test 'get_survey_key gets correct survey key' do
      ws_submission_day_0 = create :pd_workshop_foorm_submission, day: 0
      ws_submission_day_0_module = create :pd_workshop_foorm_submission, day: 0, workshop_agenda: 'module1'
      ws_submission_day_0_in_person = create :pd_workshop_foorm_submission, day: 0, workshop_agenda: 'in_person'

      ws_submission_day_1 = create :pd_workshop_foorm_submission, day: 1

      ws_submission_post = create :pd_workshop_foorm_submission
      ws_submission_post_module = create :pd_workshop_foorm_submission, workshop_agenda: 'module1_2'

      ws_submission_in_person = create :pd_workshop_foorm_submission, workshop_agenda: 'in_person'

      submissions_to_keys = [
        {ws_submission: ws_submission_day_0, expected_key: 'Pre Workshop'},
        {ws_submission: ws_submission_day_0_module, expected_key: 'Pre Workshop - Module 1'},
        {ws_submission: ws_submission_day_0_in_person, expected_key: 'Pre Workshop - In Person'},
        {ws_submission: ws_submission_day_1, expected_key: 'Day 1'},
        {ws_submission: ws_submission_post, expected_key: 'Post Workshop'},
        {ws_submission: ws_submission_post_module, expected_key: 'Post Workshop - Module 1_2'},
        {ws_submission: ws_submission_in_person, expected_key: 'Post Workshop - In Person'}
      ]

      submissions_to_keys.each do |data|
        assert_equal data[:expected_key], get_survey_key(data[:ws_submission])
      end
    end

    test 'get_index_for_survey_key gets correct index' do
      keys_to_indexes = [
        {key: 'Pre Workshop', expected_index: 0},
        {key: 'Pre Workshop - Module 1', expected_index: 1},
        {key: 'Pre Workshop - In Person', expected_index: 0},
        {key: 'Day 2', expected_index: 102},
        {key: 'Post Workshop - Module 3_4', expected_index: 1004},
        {key: 'Post Workshop', expected_index: 1000},
        {key: 'Post Workshop - In Person', expected_index: 1000}
      ]

      keys_to_indexes.each do |data|
        assert_equal data[:expected_index], get_index_for_survey_key(data[:key])
      end
    end
  end
end
