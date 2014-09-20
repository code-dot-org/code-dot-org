class AddFollowers < ActiveRecord::Migration
  def change
    create_table :followers do |t|
      t.references :user, null: false
      t.references :student_user, null: false

      t.timestamps
    end

    add_index :followers, [:user_id,:student_user_id], unique: true
    add_index :followers, :student_user_id
  end
end
