class RemoveLevelSourcesPeerReviewsForeignKey < ActiveRecord::Migration[5.0]
  def change
    remove_foreign_key :peer_reviews, :level_sources
  end
end
