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

    result[:consent_b] = required data[:consent_b]
    result[:will_teach_b] = required data[:will_teach_b]
    if result[:will_teach_b] == '0'
      result[:will_not_teach_explanation_s] = required stripped data[:will_not_teach_explanation_s]
    end
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
end
