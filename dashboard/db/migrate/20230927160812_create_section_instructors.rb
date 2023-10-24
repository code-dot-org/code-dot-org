class CreateSectionInstructors < ActiveRecord::Migration[6.1]
  def change
    create_table :section_instructors do |t|
      t.references :instructor, index: true, type: :integer, null: false, foreign_key: {to_table: :users}
      t.references :section, index: true, type: :integer, null: false
      t.references :invited_by, index: true, type: :integer, null: true, foreign_key: {to_table: :users}
      t.column :deleted_at, :datetime, index: true, null: true
      t.integer :status, null: false

      t.index [:instructor_id, :section_id], unique: true

      t.timestamps
    end
  end
end
