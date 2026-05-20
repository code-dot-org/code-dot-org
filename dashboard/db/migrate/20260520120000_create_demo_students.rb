class CreateDemoStudents < ActiveRecord::Migration[7.0]
  # In any environment that previously set CDO.demo_student_ids in locals.yml,
  # backfill rows from the legacy config from a Rails console after deploy:
  #
  #   (CDO.respond_to?(:demo_student_ids) ? CDO.demo_student_ids : nil)&.each do |type, ids|
  #     Array(ids).each do |id|
  #       DemoStudent.find_or_create_by!(user_id: id.to_i, demo_type: type.to_s)
  #     end
  #   end
  def change
    create_table :demo_students do |t|
      t.references :user,
        null: false,
        foreign_key: {on_delete: :cascade},
        type: :integer,
        index: false
      t.string :demo_type, null: false
      t.timestamps
    end
    add_index :demo_students, [:user_id, :demo_type], unique: true
    add_index :demo_students, :demo_type
  end
end
