class WipePlaintextStudentEmailsFromUsers < ActiveRecord::Migration
  def up
    User.with_deleted.
      where(user_type: 'student').
      where('email IS NOT NULL AND email <> ""').
      update_all(email: '')
  end
end
