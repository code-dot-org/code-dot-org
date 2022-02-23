class CreateCodeReviewGroupMembers < ActiveRecord::Migration[5.2]
  def change
    create_table :code_review_group_members, id: false do |t|
      # These statements create indexes on
      # code_review_group_id and follower_id (which is desired),
      # although I cannot find documentation on why that is the case.
      t.belongs_to :code_review_group, null: false
      t.belongs_to :follower, null: false

      t.timestamps
    end
  end
end
