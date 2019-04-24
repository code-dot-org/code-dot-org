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

    def find_teachercon_workshop(course:, city:, year: THIS_YEAR)
      find_scheduled_workshop(
        course: course,
        subject: Pd::Workshop::SUBJECT_TEACHER_CON,
        city: city,
        year: year
      )
    end

    def find_fit_workshop(course:, city:, year: THIS_YEAR)
      find_scheduled_workshop(
        course: course,
        subject: Pd::Workshop::SUBJECT_FIT,
        city: city,
        year: year
      )
    end

    def find_scheduled_workshop(course:, subject:, city:, year: THIS_YEAR)
      Pd::Workshop.
        in_year(year).
        where(course: course, subject: subject).
        where('location_address like ?', "%#{city}%").
        first
    end
  end
end
