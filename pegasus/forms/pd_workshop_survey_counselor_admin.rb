class PdWorkshopSurveyCounselorAdmin
  def self.normalize(data)
    result = {}

    result[:user_id_i] = integer data[:user_id_i]
    result[:email_s] = required data[:email_s]
    result[:name_s] = required data[:name_s]

    result[:enrollment_id_i] = required integer data[:enrollment_id_i]
    result[:workshop_id_i] = required integer data[:workshop_id_i]
    result[:plp_b] = required data[:plp_b]
    result[:include_demographics_b] = required data[:include_demographics_b]

    result[:how_heard_counselor_admin_ss] = required_multi_enum data, :how_heard_counselor_admin_ss
    if result[:how_heard_counselor_admin_ss].class != FieldError && result[:how_heard_counselor_admin_ss].include?(PdWorkshopSurvey::OTHER)
      result[:how_heard_other_s] = required stripped data[:how_heard_other_s]
    end

    result[:received_clear_communication_s] = required enum data[:received_clear_communication_s], PdWorkshopSurvey::AGREE_SCALE_OPTIONS
    result[:venue_feedback_s] = stripped data[:venue_feedback_s]

    result[:facilitators_came_prepared_s] = required enum data[:facilitators_came_prepared_s], PdWorkshopSurvey::AGREE_SCALE_OPTIONS
    result[:facilitators_were_responsive_s] = required enum data[:facilitators_were_responsive_s], PdWorkshopSurvey::AGREE_SCALE_OPTIONS
    result[:facilitators_kept_attention_s] = required enum data[:facilitators_kept_attention_s], PdWorkshopSurvey::AGREE_SCALE_OPTIONS
    result[:understand_why_important_s] = required enum data[:understand_why_important_s], PdWorkshopSurvey::AGREE_SCALE_OPTIONS
    result[:changed_my_opinion_s] = required enum data[:changed_my_opinion_s], PdWorkshopSurvey::AGREE_SCALE_OPTIONS

    result[:how_interested_before_s] = required_enum data, :how_interested_before_s
    result[:pacing_s] = required_enum data, :pacing_s

    result[:attendee_type_s] = required_enum data, :attendee_type_s
    if result[:attendee_type_s] == PdWorkshopSurvey::ATTENDEE_TYPE[:ADMINISTRATOR]
      result[:have_pathway_strategies_s] = required enum data[:have_pathway_strategies_s], PdWorkshopSurvey::AGREE_SCALE_OPTIONS
      result[:have_visibility_strategies_s] = required enum data[:have_visibility_strategies_s], PdWorkshopSurvey::AGREE_SCALE_OPTIONS
      result[:will_ensure_diversity_s] = required enum data[:will_ensure_diversity_s], PdWorkshopSurvey::AGREE_SCALE_OPTIONS
    else
      result[:equipped_with_strategies_s] = required enum data[:equipped_with_strategies_s], PdWorkshopSurvey::AGREE_SCALE_OPTIONS
    end
    result[:understand_curricular_offerings_s] = required enum data[:understand_curricular_offerings_s], PdWorkshopSurvey::AGREE_SCALE_OPTIONS
    result[:understand_professional_experiences_s] = required enum data[:understand_professional_experiences_s], PdWorkshopSurvey::AGREE_SCALE_OPTIONS

    result[:interested_in_offering_ss] = multi_enum data, :interested_in_offering_ss
    result[:things_facilitator_did_well_s] = stripped data[:things_facilitator_did_well_s]
    result[:things_facilitator_could_improve_s] = stripped data[:things_facilitator_could_improve_s]

    result
  end

  def self.process_(form)
    # Save this form id in the relevant dashboard pd_enrollment row
    id = form[:id]
    data = JSON.load(form[:data])
    enrollment_id = data['enrollment_id_i']
    DASHBOARD_DB[:pd_enrollments].where(id: enrollment_id).update(completed_survey_id: id)

    # We don't actually need to save any processed data with the form, so return an empty hash.
    {}
  end

  def self.get_source_id(data)
    data[:enrollment_id_i]
  end

  def self.required_enum(data, field_name)
    required enum data[field_name], PdWorkshopSurvey::OPTIONS[field_name]
  end

  def self.required_multi_enum(data, field_name)
    values = required data[field_name]
    return values if values.class == FieldError
    return FieldError.new(field_name, :invalid) if values.any? {|v| !PdWorkshopSurvey::OPTIONS[field_name].include?(v)}
    values
  end

  def self.multi_enum(data, field_name)
    values = data[field_name]
    return values if values.class == FieldError
    return [] unless values
    return FieldError.new(field_name, :invalid) if values.any? {|v| !PdWorkshopSurvey::OPTIONS[field_name].include?(v)}
    values
  end
end
