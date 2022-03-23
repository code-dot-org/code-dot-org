class SetCodeReviewEnabledDefaultToTrue < ActiveRecord::Migration[5.2]
  def change
    change_column_default :sections, :code_review_enabled, to: true
  end
end
