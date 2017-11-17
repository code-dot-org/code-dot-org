class MakeUserAndStatusNullableInPdApplications < ActiveRecord::Migration[5.0]
  def change
    change_column_null :pd_applications, :user_id, false
    change_column_null :pd_applications, :status, false
  end
end
