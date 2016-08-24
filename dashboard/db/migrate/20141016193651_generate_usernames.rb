class GenerateUsernames < ActiveRecord::Migration[4.2]
  def change
    User.with_deleted.where(username: nil).find_each do |user|
      Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
        user.generate_username
        user.save
      end
    end
  end
end
