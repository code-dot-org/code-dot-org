class WipeFullAddressFromStudents < ActiveRecord::Migration
  def up
    # Note that we intentionally use update_all to bypass validation as many
    # users do not pass validation without any changes.
    User.with_deleted.
      where(user_type: 'student').
      where.not(full_address: nil).
      update_all(full_address: nil)
  end
end
