require_relative './form'

class VolunteerEngineerSubmission < Form
  def self.normalize(data)
    result = {}

    result[:name_s] = required stripped data[:name_s]
    result[:email_s] = required email_address data[:email_s]
    result[:location_s] = required stripped data[:location_s]
    result[:time_commitment_s] = required data[:time_commitment_s]
    result[:location_flexibility_ss] = nil_if_empty data[:location_flexibility_ss]
    result[:languages_ss] = nil_if_empty data[:languages_ss]
    if result[:languages_ss].class != FieldError && (result[:languages_ss] || []).include?('other')
      result[:languages_other_ss] = required stripped csv_multivalue data[:languages_other_ss]
    end
    result[:experience_s] = nil_if_empty data[:experience_s]
    result[:description_s] = nil_if_empty data[:description_s]

    result[:linkedin_s] = nil_if_empty stripped data[:linkedin_s]
    result[:facebook_s] = nil_if_empty stripped data[:facebook_s]
    result[:skype_s] = nil_if_empty stripped data[:skype_s]
    result[:helpouts_s] = nil_if_empty stripped data[:helpouts_s]

    result[:age_18_plus_b] = required data[:age_18_plus_b]
    result[:allow_contact_b] = nil_if_empty data[:allow_contact_b]

    result
  end

  def self.receipt
    'volunteer_engineer_submission_receipt'
  end

  def self.process(data)
    {'location_p' => geocode_address(data['location_s'])}
  end

  def self.commitments
    (@commitments ||= {})[I18n.locale] ||= commitments_with_i18n_labels(
      'uncertain',
      'now_and_then',
      'one_hr_per_week',
      'three_hrs_per_week',
      'five_hrs_per_week',
      'more',
    )
  end

  def self.commitments_with_i18n_labels(*commitments)
    results = {}
    commitments.each do |commitment|
      results[commitment] = I18n.t("volunteer_engineer_submission_commitment_#{commitment}")
    end
    results
  end

  def self.locations
    (@locations ||= {})[I18n.locale] ||= locations_with_i18n_labels(
      'onsite',
      'remote',
      'curriculum',
    )
  end

  def self.locations_with_i18n_labels(*locations)
    results = {}
    locations.each do |location|
      results[location] = I18n.t("volunteer_engineer_submission_location_flexibility_#{location}")
    end
    results
  end

  def self.experiences
    (@experiences ||= {})[I18n.locale] ||= experiences_with_i18n_labels(
      'unspecified',
      'university_student_or_researcher',
      'software_professional',
    )
  end

  def self.experiences_with_i18n_labels(*experiences)
    results = {}
    experiences.each do |experience|
      results[experience] = I18n.t("volunteer_engineer_submission_experience_#{experience}")
    end
    results
  end
end
