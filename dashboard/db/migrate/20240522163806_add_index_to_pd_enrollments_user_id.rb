class AddIndexToPdEnrollmentsUserId < ActiveRecord::Migration[6.1]
  def change
    add_index :pd_enrollments, :user_id
  end
end
