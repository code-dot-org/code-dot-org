class Api::V1::Pd::SessionAttendanceSerializer < ActiveModel::Serializer
  attributes :session, :attendance

  def session
    Api::V1::Pd::SessionSerializer.new(object).attributes
  end

  # Serialize attendance for this session to an array of
  # {name, email, user_id, attended}
  def attendance
    object.workshop.enrollments.map do |enrollment|
      enrollment.user = enrollment.resolve_user
      {
        first_name: enrollment.first_name,
        last_name: enrollment.last_name,
        email: enrollment.email,
        enrollment_id: enrollment.id,
        user_id: id_or_nil(enrollment.user),
        verified_teacher_account: !!enrollment.user.try(:verified_teacher?),
        attended: attended?(enrollment),
        puzzles_completed: UserLevel.where(user_id: enrollment.user_id).passing.count
      }
    end
  end

  def id_or_nil(user)
    return nil unless user && user.sign_in_count > 0
    user.id
  end

  def attended?(enrollment)
    return true if enrollment && object.attendances.where(pd_enrollment_id: enrollment.id).exists?
    return true if enrollment.user && object.attendances.where(teacher_id: enrollment.user.id).exists?
    false
  end
end
