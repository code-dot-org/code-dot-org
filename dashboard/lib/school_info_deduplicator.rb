module SchoolInfoDeduplicator
  # Returns true if the SchoolInfo already exists and we should reuse that.
  # Returns false if the SchoolInfo is new and should be stored.
  # Validates the SchoolInfo first so that we fall into the latter path in
  # that case.
  def deduplicate_school_info(school_info_attr, self_object)
    attr = process_school_info_attributes(school_info_attr)

    return false unless SchoolInfo.new(attr).valid?

    if school_info = SchoolInfo.where(attr).first
      self_object.school_info = school_info
      return true
    end

    return false
  end

  # Processes school info attributes (as they come in from a form) to be passed into SchoolInfo.new
  def process_school_info_attributes(school_info_attr)
    attr = {
      country: school_info_attr['country'],
      school_type: school_info_attr['school_type'],
      state: school_info_attr['school_state'],
      zip: school_info_attr['school_zip'],
      school_district_id: school_info_attr['school_district_id'],
      school_district_other: school_info_attr['school_district_other'],
      school_district_name: school_info_attr['school_district_name'],
      school_id: school_info_attr['school_id'],
      school_other: school_info_attr['school_other'],
      school_name: school_info_attr['school_name'],
      full_address: school_info_attr['full_address'],
      validation_type: school_info_attr['validation_type']
    }

    # Remove empty attributes.  Notably school_district_id can come through
    # as an empty string when we don't want anything.
    attr.delete_if { |_, e| e.blank? }

    # The checkbox comes through as "true" when we really want true.
    attr[:school_district_other] = true if attr[:school_district_other] == "true"
    attr[:school_other] = true if attr[:school_other] == "true"
    attr
  end
end
