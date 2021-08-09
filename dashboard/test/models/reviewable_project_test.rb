require 'test_helper'

class ReviewableProjectTest < ActiveSupport::TestCase
  test 'only project owner can mark project reviewable' do
    project_owner = create :student
    another_student = create :student

    assert ReviewableProject.user_can_mark_project_reviewable?(project_owner, project_owner)
    assert_not ReviewableProject.user_can_mark_project_reviewable?(project_owner, another_student)
  end
end
