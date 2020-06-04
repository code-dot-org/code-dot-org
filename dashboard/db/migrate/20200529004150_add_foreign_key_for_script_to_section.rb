class AddForeignKeyForScriptToSection < ActiveRecord::Migration[5.0]
  def change
    # This migration fails in production because it takes too long to apply (roughly 4 minutes).
    # We need to add this if statement to skip running it in production so the next migration can revert it.
    return if Rails.env.production?
    add_foreign_key :sections, :scripts
  end
end
