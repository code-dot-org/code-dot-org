require 'test_helper'

class ReviewableProjectTest < ActiveSupport::TestCase
  test 'only project owner can mark project reviewable' do
    project_owner = create :student
    another_student = create :student

    assert ReviewableProject.user_can_mark_project_reviewable?(project_owner, project_owner)
    assert_not ReviewableProject.user_can_mark_project_reviewable?(project_owner, another_student)
  end

  test 'project owner cannot mark project reviewable if in a section with code review disabled' do
    project_owner = create :student
    section = create :section, code_review_enabled: false
    create :follower, section: section, student_user: project_owner

    refute ReviewableProject.user_can_mark_project_reviewable?(project_owner, project_owner)
  end
end
