require 'test_helper'

class CodeReviewTest < ActiveSupport::TestCase
  setup_all do
    @project_owner = create :student
    @project = create :project, owner: @project_owner
    @channel_id = @project.channel_id
  end

  test 'open_for_project? returns true if a code review is open for the project' do
    create :code_review, user_id: @project_owner.id, project_id: @project.id

    assert CodeReview.open_for_project?(channel: @channel_id)
  end

  test 'open_for_project? returns false if a code review is not open for the project' do
    create :code_review, user_id: @project_owner.id, project_id: @project.id, closed_at: DateTime.now

    refute CodeReview.open_for_project?(channel: @channel_id)
  end
end
