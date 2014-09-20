class AddTeacherColumnsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :user_type, :string, limit: 16, default: User::TYPE_STUDENT
    add_column :users, :school, :string
    add_column :users, :full_address, :string, limit: 1024
    add_column :users, :address, :string
    add_column :users, :city, :string
    add_column :users, :state, :string
    add_column :users, :zip, :string
    add_column :users, :lat, :float
    add_column :users, :lon, :float

    change_column(:activities, :data, :string, limit: 20000)

    User.update_all({ user_type: User::TYPE_TEACHER }, "id in (select user_id from followers)")
  end
end
