class RestrictDemoStudentsUserForeignKey < ActiveRecord::Migration[7.0]
  def up
    remove_foreign_key :demo_students, :users
    add_foreign_key :demo_students, :users, on_delete: :restrict
  end

  def down
    remove_foreign_key :demo_students, :users
    add_foreign_key :demo_students, :users, on_delete: :cascade
  end
end
