class Api::V1::Pd::CohortViewSerializerBase < ActiveModel::Serializer
  attributes(
    :id,
    :date_accepted,
    :applicant_name,
    :district_name,
    :school_name,
    :email,
    :assigned_workshop,
    :registered_workshop,
    :status
  )

  def email
    object.user.email
  end

  def assigned_workshop
    object.workshop.try(&:date_and_location_name)
  end

  def registered_workshop
    object.registered_workshop? ? 'Yes' : 'No'
  end
end
