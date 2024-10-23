class Queries::SchoolInfo
  def self.last_complete(user)
    Queries::UserSchoolInfo.last_complete(user)&.school_info
  end

  def self.current_school(user)
    existing_school_info = Queries::UserSchoolInfo.last_complete(user)&.school_info

    return nil unless existing_school_info

    # Use values from the associated nces school if it exists, otherwise fallback to school_info
    if existing_school_info.school
      # Return data directly from the associated school if it exists
      {
        school_name: existing_school_info.school.name,
        school_type: existing_school_info.school.school_type,
        school_id: existing_school_info.school.id,
        school_zip: existing_school_info.school.zip,
        country: 'US'
      }
    else
      # Return data from existing_school_info if no associated school is present
      {
        school_name: existing_school_info.school_name,
        school_type: existing_school_info.school_type,
        school_id: existing_school_info.school_id,
        school_zip: existing_school_info.zip&.to_s&.rjust(5, '0'),
        country: existing_school_info.country
      }
    end
  end
end
