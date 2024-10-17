module Services
  module Teacher
    # Updates the user permission to AUTHORIZED_TEACHER
    #
    # @param [User]
    def self.verify(teacher)
      return false unless teacher.teacher?
      return true if teacher.verified_teacher?

      teacher.permission = UserPermission::AUTHORIZED_TEACHER

      teacher.save && teacher.verified_teacher?
    end
  end
end
