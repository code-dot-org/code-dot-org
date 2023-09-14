# A migration that populates (if not already populated) a user's hashed_email
# for users having an (non-empty) email address. We bypass validation as rows
# do not pass without the change.

class PopulateHashedEmailSkippingValidation < ActiveRecord::Migration[4.2]
  def up
    User.with_deleted.
      where('email IS NOT NULL AND email <> ""').
      where('hashed_email IS NULL OR hashed_email = ""').
      find_each do |user|
      user.hash_email
      user.save(validate: false)
    end
  end

  def down
  end
end
