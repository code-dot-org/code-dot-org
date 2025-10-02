class IndexUserScriptsOnUnitGroupId < ActiveRecord::Migration[6.1]
  def change
    # Skip production because the database migration will be done manually.
    return if Rails.env.production?

    add_index :user_scripts, :unit_group_id
  end
end
