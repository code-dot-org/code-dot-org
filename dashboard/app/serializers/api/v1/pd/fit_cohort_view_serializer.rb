class Api::V1::Pd::FitCohortViewSerializer < ActiveModel::Serializer
  include Pd::Application::ActiveApplicationModels

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
    :assigned_fit,
    :registered_fit,
    :accepted_fit,
    :registered_fit_submission_time,
    :role,
    :status,
    :locked,
    :regional_partner_name,
    :course_name,
    :form_data,
    :notes,
    :notes_2,
    :notes_3,
    :notes_4,
    :notes_5,
  )

  def type
    object.class.name
  end

  def assigned_workshop
    object.workshop_date_and_location
  end

  def registered_workshop
    object.try(:registered_workshop?)
  end

  def assigned_fit
    object.try(:fit_workshop_date_and_location)
  end

  def registered_fit
    object.try(:registered_fit_workshop?)
  end

  def registered_fit_submission_time
    # Return friendly time format: "Mar 21 2019 10:33am UTC"
    object.try(FIT_WEEKEND_REGISTRATION_SYMBOL).try(:created_at).try(:strftime, '%b %d %Y %l:%M%P %Z')
  end

  def fit_assigned_at_registration
    object.try(FIT_WEEKEND_REGISTRATION_SYMBOL).try(:fit_city)
  end

  def accepted_fit
    object.try(FIT_WEEKEND_REGISTRATION_SYMBOL).try(:accepted_seat_simplified)
  end

  def role
    if object.is_a? Pd::Application::Teacher1819Application
      'Teacher'
    elsif object.is_a? Pd::Application::Facilitator1819Application
      'New Facilitator'
    elsif object.user.try {|user| user.regional_partners.any?}
      'Regional Partner'
    else
      'Lead Facilitator'
    end
  end

  def locked
    object.locked?
  end

  def form_data
    object.try(FIT_WEEKEND_REGISTRATION_SYMBOL).try(:form_data_hash)
  end
end
