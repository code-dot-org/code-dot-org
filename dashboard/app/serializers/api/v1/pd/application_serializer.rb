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
    "#{(100.0 * count / total).round(2)}%"
  end

  def school_stats
    return nil unless object.try(:school_id)

    stats = School.find_by_id(object.school_id).school_stats_by_year.order(school_year: :desc).first
    return nil unless stats

    urm_total = stats.student_am_count + stats.student_hi_count + stats.student_bl_count + stats.student_hp_count

    {
      title_i_status: stats.title_i_status,
      frl_eligible_percent: percent_string(stats.frl_eligible_total, stats.students_total),
      urm_percent: percent_string(urm_total, stats.students_total),
      students_total: stats.students_total,
      race_data: [
        {
          percent: percent_string(stats.student_am_count, stats.students_total),
          total: stats.student_am_count,
          label: "American Indian/Alaska Native Students"
        },
        {
          percent: percent_string(stats.student_as_count, stats.students_total),
          total: stats.student_as_count,
          label: "Asian Students"
        },
        {
          percent: percent_string(stats.student_hi_count, stats.students_total),
          total: stats.student_hi_count,
          label: "Hispanic Students"
        },
        {
          percent: percent_string(stats.student_bl_count, stats.students_total),
          total: stats.student_bl_count,
          label: "Black Students"
        },
        {
          percent: percent_string(stats.student_wh_count, stats.students_total),
          total: stats.student_wh_count,
          label: "White Students"
        },
        {
          percent: percent_string(stats.student_hp_count, stats.students_total),
          total: stats.student_hp_count,
          label: "Hawaiian Native/Pacific Islander Students"
        },
        {
          percent: percent_string(stats.student_tr_count, stats.students_total),
          total: stats.student_tr_count,
          label: "Two or More Races Students"
        }
      ]
    }
  end
end
