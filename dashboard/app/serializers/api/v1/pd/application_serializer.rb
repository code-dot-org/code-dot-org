class Api::V1::Pd::ApplicationSerializer < ActiveModel::Serializer
  attributes :regional_partner_name, :regional_partner_id, :locked, :notes, :form_data, :status,
    :school_name, :district_name, :email, :application_type, :response_scores,
    :meets_criteria, :bonus_points

  def email
    object.user.email
  end

  def locked
    object.locked?
  end

  # Include the full answers here
  def form_data
    object.full_answers_camelized
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
end
