class Api::V1::Pd::CohortViewSerializerBase < ActiveModel::Serializer
  # Declare attributes individually so we can make :locked a conditional attribute
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
  attribute :locked, if: :include_locked?

  def locked
    object.locked?
  end

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

  def include_locked?
    object.class.can_see_locked_status?(scope[:user])
  end
end
