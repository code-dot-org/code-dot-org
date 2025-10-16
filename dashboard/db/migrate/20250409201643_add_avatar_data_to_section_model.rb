class AddAvatarDataToSectionModel < ActiveRecord::Migration[6.1]
  def change
    add_column :sections, :avatar_color, :integer
    add_column :sections, :avatar_emoji, :integer
  end
end
