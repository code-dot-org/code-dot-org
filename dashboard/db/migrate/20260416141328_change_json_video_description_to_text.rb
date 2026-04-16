class ChangeJSONVideoDescriptionToText < ActiveRecord::Migration[7.0]
  def change
    change_column :json_videos, :description, :text
  end
end
