# frozen_string_literal: true

module TimezoneNormalizer
  def normalize_timezone(timezone)
    if timezone.is_a?(ActiveSupport::TimeZone)
      timezone
    elsif timezone.is_a?(Integer) || timezone.is_a?(String)
      ActiveSupport::TimeZone[timezone] || ActiveSupport::TimeZone['UTC']
    else
      ActiveSupport::TimeZone['UTC']
    end
  end
end
