module Policies
  # Which school year a date falls in. A school year runs 1 July YYYY to
  # 30 June YYYY+1 and is labelled by the year it starts.
  module SchoolYear
    ROLLOVER_MONTH = 7

    def self.starting_year(date = Time.zone.today)
      date.month >= ROLLOVER_MONTH ? date.year : date.year - 1
    end
  end
end
