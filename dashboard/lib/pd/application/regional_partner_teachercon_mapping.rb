module Pd::Application
  module RegionalPartnerTeacherconMapping
    THIS_YEAR = 2019

    # This is the 2018 mapping. We can update this for next year's applications.
    TEACHERCONS = [
      TC_PHOENIX = {city: 'Phoenix', dates: 'July 22 - 27, 2018'}.freeze,
      TC_ATLANTA = {city: 'Atlanta', dates: 'June 17 - 22, 2018'}.freeze,
    ].freeze

    # Map regional partner name to TeacherCon
    REGIONAL_PARTNER_TC_MAPPING = {}.freeze

    def get_matching_teachercon(regional_partner)
      return nil if regional_partner.nil?
      REGIONAL_PARTNER_TC_MAPPING[regional_partner.name]
    end
  end
end
