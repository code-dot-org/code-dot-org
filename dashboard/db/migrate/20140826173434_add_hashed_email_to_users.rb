class AddHashedEmailToUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :hashed_email, :string
    add_index "users", ["hashed_email"]

    User.with_deleted.find_each do |user|
      user.hash_email
      user.save
    end
  end
end
