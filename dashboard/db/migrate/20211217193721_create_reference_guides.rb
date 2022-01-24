class CreateReferenceGuides < ActiveRecord::Migration[5.2]
  def change
    create_table :reference_guides do |t|
      t.string :display_name
      t.string :key, null: false
      t.integer :course_version_id, null: false
      t.text :content
      t.integer :position, null: false

      t.timestamps
    end
  end
end
