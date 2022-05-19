require 'test_helper'

class CodeReviewTest < ActiveSupport::TestCase
  setup_all do
    @project_owner = create :student
    @storage_id = create_storage_id_for_user(@project_owner.id)
    @channel_id = create :project, storage_id: @storage_id
    _,  @project_id = storage_decrypt_channel_id(@channel_id)
  end

  test 'open_for_project? returns true if a code review is open for the project' do
    script_id = 12
    level_id = 5

    create :code_review, user_id: @project_owner.id, project_id: @project_id,
      script_id: script_id, level_id: level_id, closed_at: nil

    assert CodeReview.open_for_project?(channel: @channel_id)
  end

  test 'open_for_project? returns false if a code review is not open for the project' do
    script_id = 12
    level_id = 5

    create :code_review, user_id: @project_owner.id, project_id: @project_id,
      script_id: script_id, level_id: level_id, closed_at: DateTime.now

    refute CodeReview.open_for_project?(channel: @channel_id)
  end
end
