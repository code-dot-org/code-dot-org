require 'test_helper'

class PeerReviewTest < ActiveSupport::TestCase
  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns false

    level = FreeResponse.find_or_create_by!(
      game: Game.free_response,
      name: 'FreeResponseTest',
      level_num: 'custom',
      user_id: 0
    )
    level.submittable = true
    level.peer_reviewable = true
    level.save!

    @script_level = create :script_level, levels: [level]
    @user = create :user
  end

  test 'submitting a peer reviewed level should create PeerReview objects' do
    level_source = create :level_source, data: 'My submitted answer'

    initial = PeerReview.count
    @user.track_level_progress_async(@script_level, 100, true, level_source.id)
    assert_equal PeerReview::REVIEWS_PER_SUBMISSION, PeerReview.count - initial
  end
end
