require pegasus_dir 'forms/volunteer_engineer_submission'

class VolunteerEngineerSubmission2015 < VolunteerEngineerSubmission
  def self.normalize(data)
    result = {}

    result[:name_s] = required stripped data[:name_s]
    result[:company_s] = nil_if_empty stripped data[:company_s]
    result[:experience_s] = required data[:experience_s]
    result[:location_s] = required stripped data[:location_s]
    result[:location_flexibility_ss] = required data[:location_flexibility_ss]
    result[:volunteer_after_hoc_b] = nil_if_empty data[:volunteer_after_hoc_b]
    result[:time_commitment_s] = nil_if_empty data[:time_commitment_s]
    result[:linkedin_s] = nil_if_empty stripped data[:linkedin_s]
    result[:facebook_s] = nil_if_empty stripped data[:facebook_s]
    result[:description_s] = required data[:description_s]
    result[:email_s] = required email_address data[:email_s]
    result[:allow_contact_b] = required data[:allow_contact_b]

    result
  end

  def self.commitments()
    @commitments ||= commitments_with_i18n_labels(
      'annually',
      'monthly',
      'weekly',
      'more',
    )
  end

  def self.locations()
    @locations ||= locations_with_i18n_labels(
      'onsite',
      'remote',
    )
  end

  def self.locations_with_i18n_labels(*locations)
    results = {}
    locations.each do |location|
      results[location] = I18n.t("volunteer_engineer_submission_location_flexibility_#{location}")
    end
    results
  end
end
