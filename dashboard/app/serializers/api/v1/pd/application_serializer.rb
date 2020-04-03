class Api::V1::Pd::ApplicationSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  attributes(
    :regional_partner_name,
    :regional_partner_id,
    :update_emails_sent_by_system,
    :locked,
    :notes,
    :notes_2,
    :notes_3,
    :notes_4,
    :notes_5,
    :question_1,
    :question_2,
    :question_3,
    :question_4,
    :question_5,
    :question_6,
    :question_7,
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
    :school_stats,
    :status_change_log,
    :scholarship_status,
    :all_scores,
    :total_score,
    :allow_sending_principal_email
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

  def question_1
    object.try(:question_1) || nil
  end

  def question_2
    object.try(:question_2) || nil
  end

  def question_3
    object.try(:question_3) || nil
  end

  def question_4
    object.try(:question_4) || nil
  end

  def question_5
    object.try(:question_5) || nil
  end

  def question_6
    object.try(:question_6) || nil
  end

  def question_7
    object.try(:question_7) || nil
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

  def all_scores
    object.try(:all_scores)
  end

  def total_score
    object.try(:total_score)
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

  # update emails are sent by the system if there is no regional partner or if the regional partner
  # has not set the decision email flag to SENT_BY_PARTNER
  def update_emails_sent_by_system
    !(object&.regional_partner&.applications_decision_emails == RegionalPartner::SENT_BY_PARTNER)
  end

  def meets_scholarship_criteria
    object.try(:meets_scholarship_criteria)
  end

  def percent_string(count, total)
    return 'N/A' unless count && total

    "#{(100.0 * count / total).round(2)}%"
  end

  def yes_no_string(value)
    return nil if value.nil?
    value ? Pd::Application::ApplicationBase::YES : Pd::Application::ApplicationBase::NO
  end

  def school_stats
    return {} unless object.try(:school_id)

    school = School.find_by_id(object.school_id)
    stats = school&.school_stats_by_year&.order(school_year: :desc)&.first
    return {} unless stats

    urm_total = (stats.slice(:student_am_count, :student_hi_count, :student_bl_count, :student_hp_count).values.compact || []).reduce(:+) || 0

    {
      title_i_status: stats.title_i_status,
      rural_status: yes_no_string(stats.rural_school?),
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

  def status_change_log
    serialized_log = {}

    # Old status changes were logged with just the time of the change, not the person
    # doing the change. So we need to get all changes, and then find a way to resolve
    # duplicates. So we build a hash where keys are time followed by status, assuming
    # that if two entries show the same status change and are within a minute of each
    # other, they are the same change

    status_log = object.try(:status_log) || []

    status_log.each do |entry|
      entry_time = Time.parse(entry['at']).in_time_zone('America/Los_Angeles')
      entry_time_string = "#{entry_time.strftime('%F %H:%M')} #{entry_time.zone}"
      serialized_log[entry_time_string + entry['status']] = {
        title: entry['status'].titleize,
        time: entry_time_string
      }
    end

    change_log = object.sanitize_status_timestamp_change_log
    change_log.each do |entry|
      # Use the time rounded down to the minute to see if these two statuses log entries
      # are the same.
      entry_time = Time.parse(entry[:time]).in_time_zone('America/Los_Angeles')
      entry_time_string = "#{entry_time.strftime('%F %H:%M')} #{entry_time.zone}"

      serialized_log[entry_time_string + entry[:title]] = {
        title: entry[:title].titleize,
        time: entry_time_string,
        changing_user: entry[:changing_user_name]
      }.compact
    end

    serialized_log.values.sort {|x, y| Time.parse(y[:time]) <=> Time.parse(x[:time])}
  end

  def scholarship_status
    object.try(:scholarship_status)
  end

  def allow_sending_principal_email
    object.try(:allow_sending_principal_email?)
  end
end
