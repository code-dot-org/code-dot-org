class AddPropertiesToUserScripts < ActiveRecord::Migration[5.0]
  def change
    add_column :user_scripts, :properties, :text
  end
end
