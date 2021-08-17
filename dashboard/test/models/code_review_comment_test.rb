require 'test_helper'

class CodeReviewCommentTest < ActiveSupport::TestCase
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
    assert CodeReviewComment.user_can_review_project?(project_owner, project_owner)
  end

  test 'teacher can review own students project' do
    project_owner = create :student
    teacher = create :teacher
    section = create :section, code_review_enabled: true, teacher: teacher
    create :follower, section: section, student_user: project_owner
    assert CodeReviewComment.user_can_review_project?(project_owner, teacher)
  end

  test 'teacher can review own students project when code_review_enabled is false' do
    project_owner = create :student
    teacher = create :teacher
    section = create :section, code_review_enabled: false, teacher: teacher
    create :follower, section: section, student_user: project_owner
    assert CodeReviewComment.user_can_review_project?(project_owner, teacher)
  end

  test 'teacher cannot review project of a student in another section' do
    project_owner = create :student
    teacher = create :teacher
    create :section, code_review_enabled: true, teacher: teacher
    student_section = create :section, code_review_enabled: true
    create :follower, section: student_section, student_user: project_owner
    refute CodeReviewComment.user_can_review_project?(project_owner, teacher)
  end

  test 'can review peers project if code_review is enabled' do
    project_owner = create :student
    reviewer = create :student
    section = create :section, code_review_enabled: true
    create :follower, section: section, student_user: project_owner
    create :follower, section: section, student_user: reviewer
    assert CodeReviewComment.user_can_review_project?(project_owner, reviewer)
  end

  test 'cannot review peers project if code_review is disabled' do
    project_owner = create :student
    reviewer = create :student
    section = create :section, code_review_enabled: false
    create :follower, section: section, student_user: project_owner
    create :follower, section: section, student_user: reviewer
    refute CodeReviewComment.user_can_review_project?(project_owner, reviewer)
  end

  test 'cannot review project of student in a different section' do
    project_owner = create :student
    reviewer = create :student
    section = create :section, code_review_enabled: true
    reviewer_section = create :section, code_review_enabled: true
    create :follower, section: section, student_user: project_owner
    create :follower, section: reviewer_section, student_user: reviewer
    refute CodeReviewComment.user_can_review_project?(project_owner, reviewer)
  end
end
