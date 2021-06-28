require 'test_helper'

class CodeReviewCommentTest < ActiveSupport::TestCase
  test 'CodeReviewComment must have a non-nil comment' do
    code_review_comment = build :code_review_comment, comment: nil
    refute code_review_comment.valid?

    code_review_comment.comment = 'a comment'
    assert code_review_comment.valid?
  end
end
