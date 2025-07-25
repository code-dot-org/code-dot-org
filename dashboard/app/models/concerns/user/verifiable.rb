module User::Verifiable
  extend ActiveSupport::Concern
  include UserPermissionGrantee

  # Warning: Calling this method will trigger the sending of a verification email,
  # as establish in the user_permission model
  def verify_teacher!
    self.permission = UserPermission::AUTHORIZED_TEACHER
  end

  # This method just checks if a user has the authorized teacher permission
  # if you are hoping to know if someone can access content for verified instructors
  # you should use the verified_instructor? method instead which includes checks for a
  # couple different permissions that should have access instructor only content such
  # as levelbuilders
  def verified_teacher?
    permission?(UserPermission::AUTHORIZED_TEACHER)
  end

  # A user is a verified instructor if you are a universal_instructor, plc_reviewer,
  # facilitator, authorized_teacher, or levelbuilder. All of these permissions tell us someone
  # should be trusted with locked down instructor only content. It is important to use this
  # method instead of verified_teacher? as teachers will not be instructors for all courses
  #
  INSTRUCTOR_ACCESS_PERMISSIONS = [
    UserPermission::UNIVERSAL_INSTRUCTOR,
    UserPermission::PLC_REVIEWER,
    UserPermission::FACILITATOR,
    UserPermission::AUTHORIZED_TEACHER,
    UserPermission::LEVELBUILDER
  ].freeze

  def verified_instructor?
    INSTRUCTOR_ACCESS_PERMISSIONS.any? {|required_permission| permission?(required_permission)}
  end
end
