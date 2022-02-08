class CreateCodeReviewGroups < ActiveRecord::Migration[5.2]
  def change
    # This statement creates an index on section_id (which is desired),
    # although I cannot find documentation on why that is the case.
    create_table :code_review_groups do |t|
      t.belongs_to :section, null: false
      t.string :name
      t.timestamps
    end
  end
end
