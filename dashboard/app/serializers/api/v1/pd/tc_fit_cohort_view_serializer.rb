class Api::V1::Pd::TcFitCohortViewSerializer < ActiveModel::Serializer
  attributes(
    :id,
    :type,
    :date_accepted,
    :applicant_name,
    :district_name,
    :school_name,
    :email,
    :assigned_workshop,
    :registered_workshop,
    :role
  )

  def type
    object.class.name
  end

  def email
    object.user.email
  end

  def assigned_workshop
    object.workshop_date_and_location
  end

  def registered_workshop
    object.registered_workshop? ? 'Yes' : 'No'
  end

  def role
    if type == Pd::Application::Teacher1819Application.name
      'Teacher'
    elsif type == Pd::Application::Facilitator1819Application.name
      'Facilitator'
    elsif object.user.regional_partners.any?
      'Regional Partner'
    else
      'Lead Facilitator'
    end
  end
end
