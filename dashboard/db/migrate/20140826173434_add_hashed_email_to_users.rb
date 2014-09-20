class AddHashedEmailToUsers < ActiveRecord::Migration
  def change
    add_column :users, :hashed_email, :string
    add_index "users", ["hashed_email"]
 
    User.all.find_each do |user|
      user.hash_email
      user.save
    end
  end
end
