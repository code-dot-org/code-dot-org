class AddIndexesToAttendances < ActiveRecord::Migration[5.0]
  # The ExpiredDeletedAccountPurger must look up Pd::Attendances by both teacher_id and
  # marked_by_user_id in order to remove information related to the user being purged.
  # We observed that these queries, though low in volume, where accounting for 40% of
  # our DB load during the 2-hour window when this task was running.
  def change
    add_index :pd_attendances, :teacher_id
    add_index :pd_attendances, :marked_by_user_id
  end
end
