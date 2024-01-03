class AddMarkedByUserIdToPdAttendance < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_attendances, :marked_by_user_id, :integer, comment:
      'User id for the partner or admin who marked this teacher in attendance, ' \
      'or nil if the teacher self-attended.'
  end
end
