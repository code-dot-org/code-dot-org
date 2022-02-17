class CreateReferenceGuides < ActiveRecord::Migration[5.2]
  def change
    create_table :reference_guides do |t|
      t.string :key, null: false
      t.bigint :course_version_id, null: false
      t.string :parent_reference_guide_key
      t.string :display_name
      t.text :content
      t.integer :position, null: false

      t.index [:course_version_id, :key], unique: true
      t.index [:course_version_id, :parent_reference_guide_key], name: "index_reference_guides_on_course_version_id_and_parent_key"

      t.timestamps
    end
  end
end
