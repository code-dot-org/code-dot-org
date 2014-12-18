class HocSurvey2014
  
  def self.normalize(data)
    result = {}

    result[:name_s] = required stripped data[:name_s]
    result[:email_s] = required stripped data[:email_s]
    result[:country_s] = enum(data[:country_s].to_s.strip.downcase, HOC_COUNTRIES.keys)
    result[:user_description_s] = required stripped data[:user_description_s]
    result[:event_location_type_s] = stripped data[:event_location_type_s]
    result[:students_number_i] = required stripped data[:students_number_i]
    result[:students_number_girls_i] = required stripped data[:students_number_girls_i]
    result[:students_number_ethnicity_i] = required stripped data[:students_number_ethnicity_i]
    result[:students_grade_levels_ss] = stripped data[:students_grade_levels_ss]
    result[:event_tutorial_ss] = stripped data[:event_tutorial_ss]
    result[:event_technology_ss] = stripped data[:event_technology_ss]
    result[:event_experience_s] = required stripped data[:event_experience_s]
    result[:event_improvement_s] = stripped data[:event_improvement_s]
    result[:event_annual_s] = stripped data[:event_annual_s]
    result[:teacher_plan_teach_cs_s] = stripped data[:teacher_plan_teach_cs]
    result[:teacher_first_year_s] = stripped data[:teacher_first_year_s]
    result[:teacher_how_heard_s] = stripped data[:teacher_how_heard_s]

    result
  end

  def self.claim_prize_code(type, user_id, params={})
    ip_address = params[:ip_address] || request.ip
  
    begin
      rows_updated = DB[:hoc_survey_prizes].where(claimant:nil, type:type).limit(1).update(
        claimant:user_id,
        claimed_at:DateTime.now,
        claimed_ip:ip_address,
      )
      raise StandardError, "Out of '#{type}' codes." if rows_updated == 0
    rescue Sequel::UniqueConstraintViolation
      # This user has already claimed a prize, the query below will return that existing prize.
    rescue
      raise
    end

    DB[:hoc_survey_prizes].where(claimant:user_id).first
  end

end
