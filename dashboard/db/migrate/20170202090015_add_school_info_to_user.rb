class AddSchoolInfoToUser < ActiveRecord::Migration[5.0]
  def change
    add_reference :users, :school_info, index: true, default: nil, null: true, after: :full_address
  end
end
