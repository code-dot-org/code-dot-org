class CreateDemoStudents < ActiveRecord::Migration[7.0]
  def change
    create_table :demo_students do |t|
      t.references :user, null: false, foreign_key: true, type: :integer
      t.string :demo_type, null: false
      t.timestamps
    end
    add_index :demo_students, [:user_id, :demo_type], unique: true
    add_index :demo_students, :demo_type
  end
end
