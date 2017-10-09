class AddTempSchoolInfoIdToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :_school_info_id, :integer
  end
end
