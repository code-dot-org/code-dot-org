class MakeUserAndStatusNullableInPdApplications < ActiveRecord::Migration[5.0]
  def up
    change_column_null :pd_applications, :user_id, true
    change_column_null :pd_applications, :status, true
  end

  def down
    Pd::Application::ApplicationBase.where(user_id: nil).update(user_id: 0)
    Pd::Application::ApplicationBase.where(status: nil).update(status: 'unreviewed')

    change_column_null :pd_applications, :user_id, false
    change_column_null :pd_applications, :status, false
  end
end
