class Api::V1::Pd::CohortViewSerializerBase < ActiveModel::Serializer
  attribute :id
  attribute :date_accepted
  attribute :applicant_name
  attribute :district_name
  attribute :school_name
  attribute :email
  attribute :assigned_workshop
  attribute :registered_workshop
  attribute :status
  attribute :notes
  attribute :notes_2
  attribute :notes_3
  attribute :notes_4
  attribute :notes_5

  def email
    object.user.email
  end

  def assigned_workshop
    object.workshop_date_and_location
  end

  def registered_workshop
    if object.workshop.try(:local_summer?)
      object.registered_workshop? ? 'Yes' : 'No'
    end
  end
end
