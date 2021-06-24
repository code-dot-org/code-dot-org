class CodeReviewCommentsController < ApplicationController
  # require permit description: https://stackoverflow.com/questions/18424671/what-is-params-requireperson-permitname-age-doing-in-rails-4
  # require commenter id, project id, project version, comment
  def create
  end

  # require code_review_comment_id, permit comment? is_resolved?
  def update
  end

  # may be able to remove and implement using update
  def resolve
  end

  # require code_review_comment_id
  def destroy
  end

  # require project id, project version
  def project_comments
  end
end
