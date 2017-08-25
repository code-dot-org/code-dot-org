class BackfillAuthorizedTeacherUserPermissions < ActiveRecord::Migration[5.0]
  def up
    Plc::UserCourseEnrollment.find_each do |enrollment|
      UserPermission.find_or_create_by(permission: UserPermission::AUTHORIZED_TEACHER, user_id: enrollment.user_id)
    end

    Cohort.find_each do |cohort|
      cohort.teachers.each do |teacher|
        UserPermission.find_or_create_by(permission: UserPermission::AUTHORIZED_TEACHER, user_id: teacher.id)
      end
    end
  end

  def down
  end
end
