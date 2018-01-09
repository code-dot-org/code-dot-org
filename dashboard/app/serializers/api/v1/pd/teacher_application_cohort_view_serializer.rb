class Api::V1::Pd::TeacherApplicationCohortViewSerializer < ActiveModel::Serializer
  attributes :id, :date_accepted, :applicant_name, :district_name, :school_name, :email,
    :assigned_workshop, :registered_workshop

  def date_accepted
    object.accepted_at.try(:strftime, '%b %e')
  end

  def email
    object.user.email
  end

  def assigned_workshop
    object.pd_workshop_id ? Pd::Workshop.find(object.pd_workshop_id).location_city : ''
  end

  def registered_workshop
    if object.pd_workshop_id
      Pd::Enrollment.exists?(pd_workshop_id: object.pd_workshop_id, user_id: object.user_id) ? 'Yes' : 'No'
    else
      ''
    end
  end
end
