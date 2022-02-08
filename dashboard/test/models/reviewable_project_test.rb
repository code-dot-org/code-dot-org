require 'test_helper'

class ReviewableProjectTest < ActiveSupport::TestCase
  test 'only project owner can mark project reviewable' do
    # This is default behavior so stub is unnecessary, but adding this
    # so when can search for the DCDO string to clean up
    # we remember to delete this test at that time.
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(false)

    project_owner = create :student
    another_student = create :student

    assert ReviewableProject.user_can_mark_project_reviewable?(project_owner, project_owner)
    assert_not ReviewableProject.user_can_mark_project_reviewable?(project_owner, another_student)
  end

  test 'project owner cannot mark project reviewable if in a section with code review disabled' do
    # This is default behavior so stub is unnecessary, but adding this
    # so when can search for the DCDO string to clean up
    # we remember to delete this test at that time.
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(false)

    project_owner = create :student
    section = create :section, code_review_enabled: false
    create :follower, section: section, student_user: project_owner

    refute ReviewableProject.user_can_mark_project_reviewable?(project_owner, project_owner)
  end

  test 'project owner cannot mark project reviewable if not in code review group' do
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(true)

    project_owner = create :student
    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    create :follower, section: section, student_user: project_owner

    refute ReviewableProject.user_can_mark_project_reviewable?(project_owner, project_owner)
  end

  test 'project owner can mark project reviewable if in code review group and section with code review enabled' do
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(true)

    project_owner = create :student
    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    follower = create :follower, section: section, student_user: project_owner
    code_review_group = create :code_review_group, section: section
    create :code_review_group_member, follower: follower, code_review_group: code_review_group

    assert ReviewableProject.user_can_mark_project_reviewable?(project_owner, project_owner)
  end

  test 'project owner cannot mark project reviewable if section has code review disabled' do
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(true)

    project_owner = create :student
    section = create :section, code_review_expires_at: Time.now.utc - 1.day
    create :follower, section: section, student_user: project_owner

    refute ReviewableProject.user_can_mark_project_reviewable?(project_owner, project_owner)
  end
end
