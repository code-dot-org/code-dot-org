module SchoolInfoDeduplicator
  # Returns true if the SchoolInfo already exists and we should reuse that.
  # Returns false if the SchoolInfo is new and should be stored or if it is invalid,
  # in which case we allow the save to fail as usual
  def deduplicate_school_info(school_info_attr, self_object)
    school_info = get_duplicate_school_info(school_info_attr)
    if school_info
      self_object.school_info = school_info
      return true
    else
      return false
    end
  end

  # Returns the SchoolInfo if it already exists.
  # Returns nil if the SchoolInfo is new or if it is invalid.
  def get_duplicate_school_info(school_info_attr)
    attr = process_school_info_attributes(school_info_attr)

    return false unless SchoolInfo.new(attr).valid?

    # If the SchoolInfo is related to a School then any fully validated school info for that same school id is a match
    school_info =
      if attr[:school_id]
        SchoolInfo.where(school_id: attr[:school_id], validation_type: SchoolInfo::VALIDATION_FULL).first
      else
        SchoolInfo.where(attr).first
      end
    if school_info
      return school_info
    end

    return nil
  end

  # Processes school info attributes (as they come in from a form) to be passed into SchoolInfo.new
  def process_school_info_attributes(school_info_attr)
    attr = school_info_attr.symbolize_keys

    # Names of state and zip fields change between form fields and SchoolInfo class
    attr[:state] ||= school_info_attr[:school_state]
    attr[:zip] ||= school_info_attr[:school_zip]

    # The checkbox comes through as "true" when we really want true.
    attr[:school_district_other] &&= attr[:school_district_other].to_bool
    attr[:school_other] &&= attr[:school_other].to_bool

    relevant_attributes = [
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
    ]

    # Keep only the relevant attributes to use when we query for a duplicate
    attr.slice!(*relevant_attributes)

    # Make sure all fields are present so that they will match against only null
    # values when we run the query for existing school_infos
    relevant_attributes.map do |attribute|
      attr[attribute] = nil if attr[attribute].blank?
    end

    # validation_type defaults to 'full' so make sure we match on that rather than null if it isn't set.
    # school_district_other and school_other also have default values, but since they are nullable
    # they will not be given those values unless explicitly set so we don't override what was passed
    # in for them.
    attr[:validation_type] ||= 'full'

    attr
  end
end
