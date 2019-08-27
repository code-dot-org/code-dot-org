class Race
  # races: array of strings, the races that a student has selected.
  # Allowed values for race are:
  #   white: "White"
  #   black: "Black or African American"
  #   hispanic: "Hispanic or Latino"
  #   asian: "Asian"
  #   hawaiian: "Native Hawaiian or other Pacific Islander"
  #   american_indian: "American Indian/Alaska Native"
  #   other: "Other"
  #   opt_out: "Prefer not to say" (but selected this value and hit "Submit")
  #
  # Depending on the user's actions, the following values may also be applied:
  #   closed_dialog: This is a special value indicating that the user closed the
  #     dialog rather than selecting a race.
  #   nonsense: This is a special value indicating that the user chose
  #     (strictly) more than five races.
  DISPLAY_RACES = %w(
    white
    black
    hispanic
    asian
    hawaiian
    american_indian
    other
    opt_out
  ).freeze

  VALID_RACES = DISPLAY_RACES + %w(
    closed_dialog
    nonsense
  ).freeze

  # @return [Boolean, nil] Whether the the list of races stored in the `races` column represents an
  # under-represented minority.
  #   - true: Yes, a URM user.
  #   - false: No, not a URM user.
  #   - nil: Don't know, may or may not be a URM user.
  def any_urm?(races)
    return nil unless races

    races_as_list = races.split ','
    return nil if races_as_list.empty?
    return nil if (races_as_list & ['opt_out', 'nonsense', 'closed_dialog']).any?
    return true if (races_as_list & ['black', 'hispanic', 'hawaiian', 'american_indian']).any?
    false
  end

  def sanitize(races)
    if races
      races_as_list = races.split ','
      if races_as_list.include? 'closed_dialog'
        return 'closed_dialog'
      elsif races_as_list.length > 5
        return 'nonsense'
      else
        races_as_list.each do |race|
          return 'nonsense' unless VALID_RACES.include? race
        end
      end
    end

    races
  end
end
