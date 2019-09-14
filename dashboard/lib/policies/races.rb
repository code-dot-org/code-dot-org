class Policies::Races
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
  def self.any_urm?(races)
    races = normalize(races)

    return nil unless races
    return nil if races.empty?
    return nil if (races & ['opt_out', 'nonsense', 'closed_dialog']).any?
    return true if (races & ['black', 'hispanic', 'hawaiian', 'american_indian']).any?

    false
  end

  def self.sanitized(races)
    races = normalize(races)

    return ['closed_dialog'] if races.include?('closed_dialog')
    return ['nonsense'] if races.length > 5
    return ['nonsense'] unless (races - VALID_RACES).empty?

    races
  end

  def self.normalize(races)
    return races if races.is_a? Array
    return races.split(",") if races.is_a? String
    return [] if races.nil?

    raise TypeError.new("Expected either nil, an array, or a comma-separated string; got #{races.inspect}")
  end
end
