class Api::V1::Pd::ApplicationSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  attributes :regional_partner_name, :regional_partner_id, :locked, :notes, :form_data, :status,
    :school_name, :district_name, :email, :application_type, :response_scores, :course, :course_name,
    :meets_criteria, :bonus_points, :pd_workshop_id, :fit_workshop_name, :fit_workshop_url,
    :meets_criteria, :bonus_points, :pd_workshop_id, :pd_workshop_name, :pd_workshop_url,
    :fit_workshop_id, :fit_workshop_name, :fit_workshop_url, :application_guid,
    :registered_teachercon, :registered_fit_weekend

  def email
    object.user.email
  end

  def locked
    object.locked?
  end

  # Include the full answers here, unless otherwise specified
  def form_data
    @scope[:raw_form_data] ? object.form_data_hash : object.full_answers_camelized
  end

  def response_scores
    JSON.parse(object.response_scores || '{}').transform_keys {|x| x.camelize :lower}
  end

  def meets_criteria
    object.try(:meets_criteria) || nil
  end

  def bonus_points
    object.try(:total_score) || nil
  end

  def pd_workshop_id
    object.try(:pd_workshop_id)
  end

  def pd_workshop_name
    object.try(:workshop).try(:date_and_location_name)
  end

  def pd_workshop_url
    workshop = object.try(:workshop)
    url_for(controller: 'pd/workshop_dashboard', path: "workshops/#{workshop.id}") if workshop
  end

  def fit_workshop_id
    object.try(:fit_workshop_id)
  end

  def fit_workshop_name
    object.try(:fit_workshop).try(:date_and_location_name)
  end

  def fit_workshop_url
    workshop = object.try(:fit_workshop)
    url_for(controller: 'pd/workshop_dashboard', path: "workshops/#{workshop.id}") if workshop
  end

  def registered_teachercon
    !!object.try(:teachercon_registration)
  end

  def registered_fit_weekend
    !!object.try(:fit_weekend_registration)
  end
end
