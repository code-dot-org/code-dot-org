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
    :accepted_teachercon,
    :assigned_fit,
    :registered_fit,
    :accepted_fit,
    :role,
    :status,
    :locked,
    :regional_partner_name,
    :form_data
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

  def accepted_teachercon
    # object is either an application (with possibly a linked TC registration), or itself a TC registration
    (object.try(:pd_teachercon1819_registration) || object).try(:accepted_seat_simplified)
  end

  def assigned_fit
    object.try(:fit_workshop_date_and_location)
  end

  def registered_fit
    object.try(:registered_fit_workshop?)
  end

  def accepted_fit
    object.try(:pd_fit_weekend1819_registration).try(:accepted_seat_simplified)
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
    if @scope[:view] == 'teachercon'
      if object.is_a? Pd::Teachercon1819Registration
        object.form_data_hash
      else
        object.try(:pd_teachercon1819_registration).try(:form_data_hash)
      end
    else # fit
      object.try(:pd_fit_weekend1819_registration).try(:form_data_hash)
    end
  end
end
