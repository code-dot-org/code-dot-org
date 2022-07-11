require 'test_helper'

class ReviewableProjectTest < ActiveSupport::TestCase
  test 'project owner cannot mark project reviewable if not in code review group' do
    project_owner = create :student
    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    create :follower, section: section, student_user: project_owner

    refute ReviewableProject.user_can_mark_project_reviewable?(project_owner, project_owner)
  end

  test 'project owner can mark project reviewable if in code review group and section with code review enabled' do
    project_owner = create :student
    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    follower = create :follower, section: section, student_user: project_owner
    code_review_group = create :code_review_group, section: section
    create :code_review_group_member, follower: follower, code_review_group: code_review_group

    assert ReviewableProject.user_can_mark_project_reviewable?(project_owner, project_owner)
  end

  test 'project owner cannot mark project reviewable if section has code review disabled' do
    project_owner = create :student
    section = create :section, code_review_expires_at: Time.now.utc - 1.day
    create :follower, section: section, student_user: project_owner

    refute ReviewableProject.user_can_mark_project_reviewable?(project_owner, project_owner)
  end
end
