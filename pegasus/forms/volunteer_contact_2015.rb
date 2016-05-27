class VolunteerContact2015

  def self.normalize(data)
    result = {}

    result[:name_s] = required stripped data[:teacher_name_s]
    result[:email_s] = required email_address data[:teacher_email_s]
    result[:school_name_s] = required stripped data[:school_name_s]
    result[:school_location_s] = required stripped data[:school_location_s]
    result[:type_task_onsite_b] = nil_if_empty data[:type_task_onsite_b]
    result[:type_task_remote_b] = nil_if_empty data[:type_task_remote_b]
    result[:type_task_mentor_b] = nil_if_empty data[:type_task_mentor_b]

    # We use the volunteer's ID from the forms table (kind: VolunteerEngineerSubmission2015)
    # to get the volunteer's name and email when emailing the volunteer about the teacher.
    result[:volunteer_id_i] = required stripped data[:volunteer_id_i]

    form = DB[:forms].where(kind: "VolunteerEngineerSubmission2015", id: data[:volunteer_id_i]).first
    volunteer = JSON.parse(form[:data])

    result[:volunteer_name_s] = required volunteer["name_s"]
    result[:volunteer_email_s] = required volunteer["email_s"]
    result[:volunteer_secret_s] = required form[:secret]

    result
  end

  def self.receipt()
    'volunteer_contact_2015_receipt'
  end

  def self.type_tasks()
    (@type_tasks ||= {})[I18n.locale] ||= type_tasks_with_i18n_labels(
      'onsite',
      'remote',
      'mentor',
    )
  end

  def self.type_tasks_with_i18n_labels(*type_tasks)
    results = {}
    type_tasks.each do |task|
      results[task] = I18n.t("volunteer_engineer_submission_type_task_#{task}")
    end
    results
  end
end
