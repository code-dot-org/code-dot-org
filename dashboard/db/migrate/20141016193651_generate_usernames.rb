class GenerateUsernames < ActiveRecord::Migration
  def change
    User.where(username: nil).find_each do |user|
      retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
        user.generate_username
        user.save
      end
    end
  end
end
