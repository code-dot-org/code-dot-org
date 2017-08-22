class BackfillAuthorizedTeacherUserPermissions < ActiveRecord::Migration[5.0]
  def up
    Plc::UserCourseEnrollment.find_each do |enrollment|
      UserPermission.create(permission: UserPermission::AUTHORIZED_TEACHER, user_id: enrollment.user_id)
    end

    Cohort.find_each do |cohort|
      cohort.teachers.each do |teacher|
        UserPermission.create(permission: UserPermission::AUTHORIZED_TEACHER, user_id: teacher.id)
      end
    end
  end

  def down
    UserPermission.where(permission: UserPermission::AUTHORIZED_TEACHER).destroy_all
  end
end
