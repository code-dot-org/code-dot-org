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
end
