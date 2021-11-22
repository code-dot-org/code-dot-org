require 'test_helper'

class CodeReviewCommentTest < ActiveSupport::TestCase
  setup_all do
    @project_level_id = 12
    @project_script_id = 34
    @project_storage_app_id = 56
  end

  test 'must have a non-nil comment' do
    code_review_comment = build :code_review_comment, comment: nil
    refute code_review_comment.valid?

    code_review_comment.comment = 'a comment'
    assert code_review_comment.valid?
  end

  test 'comment from student is marked as not from teacher' do
    student = create :student
    code_review_comment = create :code_review_comment, commenter: student
    assert_equal false, code_review_comment.is_from_teacher?
  end

  test 'comment from teacher is marked as from teacher' do
    teacher = create :teacher
    code_review_comment = create :code_review_comment, commenter: teacher
    assert_equal true, code_review_comment.is_from_teacher?
  end

  test 'can review own project' do
    project_owner = create :student
    assert CodeReviewComment.user_can_review_project?(project_owner, project_owner, nil)
  end

  test 'teacher can review own students project' do
    project_owner = create :student
    teacher = create :teacher
    section = create :section, code_review_enabled: Time.now.utc + 1.day, teacher: teacher
    create :follower, section: section, student_user: project_owner
    assert CodeReviewComment.user_can_review_project?(project_owner, teacher, nil)
  end

  test 'teacher can review own students project when code_review_enabled is false' do
    # This is default behavior so stub is unnecessary, but adding this
    # so when can search for the DCDO string to clean up
    # we remember to delete this test at that time.
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(false)

    project_owner = create :student
    teacher = create :teacher
    section = create :section, code_review_enabled: false, teacher: teacher
    create :follower, section: section, student_user: project_owner
    assert CodeReviewComment.user_can_review_project?(project_owner, teacher, nil)
  end

  test 'teacher can review own students project when code_review_enabled is false and code review groups enabled' do
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(true)

    project_owner = create :student
    teacher = create :teacher
    section = create :section, code_review_expires_at: Time.now.utc - 1.day, teacher: teacher
    create :follower, section: section, student_user: project_owner
    assert CodeReviewComment.user_can_review_project?(project_owner, teacher, nil)
  end

  test 'teacher cannot review project of a student in another section' do
    # This is default behavior so stub is unnecessary, but adding this
    # so when can search for the DCDO string to clean up
    # we remember to delete this test at that time.
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(false)

    project_owner = create :student
    teacher = create :teacher
    create :section, code_review_enabled: true, teacher: teacher
    student_section = create :section, code_review_enabled: true
    create :follower, section: student_section, student_user: project_owner
    refute CodeReviewComment.user_can_review_project?(project_owner, teacher, nil)
  end

  test 'teacher cannot review project of a student in another section with code review groups enabled' do
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(true)

    project_owner = create :student
    teacher = create :teacher
    create :section, code_review_expires_at: Time.now.utc + 1.day, teacher: teacher
    student_section = create :section, code_review_expires_at: Time.now.utc + 1.day
    create :follower, section: student_section, student_user: project_owner
    refute CodeReviewComment.user_can_review_project?(project_owner, teacher, nil)
  end

  test 'can review peers project if code_review is enabled' do
    # This is default behavior so stub is unnecessary, but adding this
    # so when can search for the DCDO string to clean up
    # we remember to delete this test at that time.
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(false)

    project_owner = create :student
    reviewer = create :student
    section = create :section, code_review_enabled: true
    create :follower, section: section, student_user: project_owner
    create :follower, section: section, student_user: reviewer
    create :reviewable_project,
      user_id: project_owner.id,
      storage_app_id: @project_storage_app_id,
      level_id: @project_level_id,
      script_id: @project_script_id
    assert CodeReviewComment.user_can_review_project?(project_owner, reviewer, @project_storage_app_id, @project_level_id, @project_script_id)
  end

  test 'can review peers project if in same section and in same code review group' do
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(true)

    project_owner = create :student
    reviewer = create :student
    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    project_owner_follower = create :follower, section: section, student_user: project_owner
    reviewer_follower = create :follower, section: section, student_user: reviewer
    create :reviewable_project,
      user_id: project_owner.id,
      storage_app_id: @project_storage_app_id,
      level_id: @project_level_id,
      script_id: @project_script_id

    code_review_group = create :code_review_group, section: section
    create :code_review_group_member, follower: project_owner_follower, code_review_group: code_review_group
    create :code_review_group_member, follower: reviewer_follower, code_review_group: code_review_group

    assert CodeReviewComment.user_can_review_project?(project_owner, reviewer, @project_storage_app_id, @project_level_id, @project_script_id)
  end

  test 'cannot review peers project if there is no reviewable project' do
    project_owner = create :student
    reviewer = create :student
    section = create :section, code_review_enabled: true
    create :follower, section: section, student_user: project_owner
    create :follower, section: section, student_user: reviewer
    refute CodeReviewComment.user_can_review_project?(project_owner, reviewer, @project_storage_app_id, @project_level_id, @project_script_id)
  end

  test 'cannot review peers project if code_review is disabled' do
    # This is default behavior so stub is unnecessary, but adding this
    # so when can search for the DCDO string to clean up
    # we remember to delete this test at that time.
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(false)

    project_owner = create :student
    reviewer = create :student
    section = create :section, code_review_enabled: false
    create :follower, section: section, student_user: project_owner
    create :follower, section: section, student_user: reviewer
    create :reviewable_project,
      user_id: project_owner.id,
      storage_app_id: @project_storage_app_id,
      level_id: @project_level_id,
      script_id: @project_script_id
    refute CodeReviewComment.user_can_review_project?(project_owner, reviewer, @project_storage_app_id, @project_level_id, @project_script_id)
  end

  test 'cannot review peers project if code_review is disabled and students are in same code review group' do
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(true)

    project_owner = create :student
    reviewer = create :student
    section = create :section, code_review_expires_at: nil
    project_owner_follower = create :follower, section: section, student_user: project_owner
    reviewer_follower = create :follower, section: section, student_user: reviewer
    create :reviewable_project,
      user_id: project_owner.id,
      storage_app_id: @project_storage_app_id,
      level_id: @project_level_id,
      script_id: @project_script_id
    code_review_group = create :code_review_group, section: section
    create :code_review_group_member, follower: project_owner_follower, code_review_group: code_review_group
    create :code_review_group_member, follower: reviewer_follower, code_review_group: code_review_group

    refute CodeReviewComment.user_can_review_project?(project_owner, reviewer, @project_storage_app_id, @project_level_id, @project_script_id)
  end

  test 'cannot review project of student in a different section' do
    # This is default behavior so stub is unnecessary, but adding this
    # so when can search for the DCDO string to clean up
    # we remember to delete this test at that time.
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(false)

    project_owner = create :student
    reviewer = create :student
    section = create :section, code_review_enabled: true
    reviewer_section = create :section, code_review_enabled: true
    create :follower, section: section, student_user: project_owner
    create :follower, section: reviewer_section, student_user: reviewer
    create :reviewable_project,
      user_id: project_owner.id,
      storage_app_id: @project_storage_app_id,
      level_id: @project_level_id,
      script_id: @project_script_id
    refute CodeReviewComment.user_can_review_project?(project_owner, reviewer, @project_storage_app_id, @project_level_id, @project_script_id)
  end

  test 'cannot review project of student in a different section even if both in code review groups' do
    DCDO.stubs(:get).with('code_review_groups_enabled', false).returns(true)

    project_owner = create :student
    reviewer = create :student
    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    reviewer_section = create :section, code_review_expires_at: Time.now.utc + 1.day
    project_owner_follower = create :follower, section: section, student_user: project_owner
    reviewer_follower = create :follower, section: reviewer_section, student_user: reviewer
    create :reviewable_project,
      user_id: project_owner.id,
      storage_app_id: @project_storage_app_id,
      level_id: @project_level_id,
      script_id: @project_script_id

    reviewer_code_review_group = create :code_review_group, section: reviewer_section
    project_owner_code_review_group = create :code_review_group, section: section
    create :code_review_group_member, follower: project_owner_follower, code_review_group: project_owner_code_review_group
    create :code_review_group_member, follower: reviewer_follower, code_review_group: reviewer_code_review_group

    refute CodeReviewComment.user_can_review_project?(project_owner, reviewer, @project_storage_app_id, @project_level_id, @project_script_id)
  end
end
