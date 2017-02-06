class AddSchoolInfoToUser < ActiveRecord::Migration[5.0]
  def change
    add_reference :users, :school_info, index: true
  end
end
