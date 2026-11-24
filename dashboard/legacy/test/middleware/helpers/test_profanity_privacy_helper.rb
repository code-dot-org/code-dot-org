require_relative '../middleware_test_helper'
require 'cdo/share_filtering'
require_relative '../../../middleware/helpers/profanity_privacy_helper'

# The share filter's verdict on a saved project's main.json.
class ProfanityPrivacyHelperTest < Minitest::Test
  # A Quest Builder project whose one scene has a say block.
  def quest_builder_body(fields)
    block = {type: 'gamelab_spriteSay', fields: fields}
    scenes = [{id: 'scene-1', name: 'Scene 1', source: {blocks: {blocks: [block]}}}]
    StringIO.new({scenes: scenes}.to_json)
  end

  def test_a_phone_number_in_a_say_block_is_a_share_failure
    ProfanityFilter.stubs(:find_potential_profanity).returns nil
    failure = share_failure_from_body(quest_builder_body({SPEECH: 'Call me at 206-555-0142'}), 'en', 'quest_builder')
    assert_equal ShareFiltering::FailureType::PHONE, failure.type
  end

  def test_a_failing_profanity_service_leaves_the_project_viewable_and_is_reported
    failures = [Net::ReadTimeout.new('read'), Errno::ECONNREFUSED.new, StandardError.new('Profanity check failed')]
    Observability::Errors.expects(:report).times(failures.length)
    failures.each do |failure|
      ProfanityFilter.stubs(:find_potential_profanity).raises(failure)
      assert_equal false, share_failure_from_body(quest_builder_body({SPEECH: 'Hello there'}), 'en', 'quest_builder')
    end
  end

  def test_a_project_the_filter_cannot_read_is_an_error_and_not_viewable
    Observability::Errors.expects(:report).never
    # The block's fields are not a table of fields.
    assert_raises(NoMethodError) do
      share_failure_from_body(quest_builder_body('Call me at 206-555-0142'), 'en', 'quest_builder')
    end
  end
end
