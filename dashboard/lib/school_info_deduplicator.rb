module SchoolInfoDeduplicator
  # Returns true if the SchoolInfo already exists and we should reuse that.
  # Returns false if the SchoolInfo is new and should be stored or if it is invalid,
  # in which case we allow the save to fail as usual
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
    attr = school_info_attr.symbolize_keys

    # Names of state and zip fields change between form fields and SchoolInfo class
    attr[:state] ||= school_info_attr['school_state']
    attr[:zip] ||= school_info_attr['school_zip']

    attr.slice!(
      :country,
      :school_type,
      :state,
      :zip,
      :school_district_id,
      :school_district_other,
      :school_district_name,
      :school_id,
      :school_other,
      :school_name,
      :full_address,
      :validation_type
    )

    # Remove empty attributes.  Notably school_district_id can come through
    # as an empty string when we don't want anything.
    attr.delete_if {|_, e| e.blank?}

    # The checkbox comes through as "true" when we really want true.
    attr[:school_district_other] &&= attr[:school_district_other].to_bool
    attr[:school_other] &&= attr[:school_other].to_bool
    attr
  end
end
