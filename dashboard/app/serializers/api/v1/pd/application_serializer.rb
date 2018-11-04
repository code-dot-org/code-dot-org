class Api::V1::Pd::ApplicationSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  attributes(
    :regional_partner_name,
    :regional_partner_id,
    :regional_partner_emails_sent_by_system,
    :locked,
    :notes,
    :form_data,
    :status,
    :school_name,
    :district_name,
    :email,
    :application_year,
    :application_type,
    :response_scores,
    :course,
    :course_name,
    :meets_criteria,
    :bonus_points,
    :pd_workshop_id,
    :pd_workshop_name,
    :fit_workshop_id,
    :pd_workshop_url,
    :fit_workshop_name,
    :fit_workshop_url,
    :application_guid,
    :registered_teachercon,
    :registered_fit_weekend,
    :attending_teachercon,
    :principal_approval_state,
    :meets_scholarship_criteria,
    :school_stats
  )

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
    object.try(:response_scores_hash) || {}
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

  def attending_teachercon
    object&.workshop&.teachercon?
  end

  def principal_approval_state
    object.try(:principal_approval_state)
  end

  def regional_partner_emails_sent_by_system
    object&.regional_partner&.applications_decision_emails == RegionalPartner::SENT_BY_SYSTEM
  end

  def meets_scholarship_criteria
    object.try(:meets_scholarship_criteria)
  end

  def percent_string(count, total)
    return 'No data' unless count && total

    "#{(100.0 * count / total).round(2)}%"
  end

  def school_stats
    return {} unless object.try(:school_id)

    school = School.find_by_id(object.school_id)
    stats = school.school_stats_by_year.order(school_year: :desc).first
    return {} unless stats

    urm_total = (stats.slice(:student_am_count, :student_hi_count, :student_bl_count, :student_hp_count).values.compact || []).reduce(:+) || 0

    {
      title_i_status: stats.title_i_status,
      school_type: school.school_type.try(:titleize),
      frl_eligible_percent: percent_string(stats.frl_eligible_total, stats.students_total),
      urm_percent: percent_string(urm_total, stats.students_total),
      students_total: stats.students_total,
      american_indian_alaskan_native_percent: percent_string(stats.student_am_count, stats.students_total),
      asian_percent: percent_string(stats.student_as_count, stats.students_total),
      black_or_african_american_percent: percent_string(stats.student_bl_count, stats.students_total),
      hispanic_or_latino_percent: percent_string(stats.student_hi_count, stats.students_total),
      native_hawaiian_or_pacific_islander_percent: percent_string(stats.student_hp_count, stats.students_total),
      white_percent: percent_string(stats.student_wh_count, stats.students_total),
      two_or_more_races_percent: percent_string(stats.student_tr_count, stats.students_total)
    }
  end
end
