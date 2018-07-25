class ChangeAuthenticationOptionDataToText < ActiveRecord::Migration[5.0]
  def up
    change_column :authentication_options, :data, :text
  end

  def down
    change_column :authentication_options, :data, :string
  end
end
