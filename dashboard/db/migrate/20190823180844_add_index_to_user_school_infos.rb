class AddIndexToUserSchoolInfos < ActiveRecord::Migration[5.0]
  def change
    add_index :user_school_infos, :user_id
  end
end
