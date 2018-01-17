module Pd::Application
  module RegionalPartnerTeacherconMapping
    # This is the 2018 mapping. We can update this for next year's applications.
    TEACHERCONS = [
      TC_PHOENIX = {city: 'Phoenix', dates: 'July 22 - 27, 2018'},
      TC_ATLANTA = {city: 'Atlanta', dates: 'June 17 - 22, 2018'},
    ]

    # Map regional partner name to TeacherCon
    REGIONAL_PARTNER_TC_MAPPING = {
      'Allegheny Intermediate Unit 3' => TC_PHOENIX,
      'America Campaign/TIE Partnership (ND, SD, WY)' => TC_PHOENIX,
      'Fresno County Superintendent of Schools' => TC_ATLANTA,
      'Institute for School Partnership  Washington University in St. Louis' => TC_ATLANTA,
      'Mississippi State University' => TC_ATLANTA,
      'Sacramento County Office of Education' => TC_PHOENIX,
      'Tampa Bay STEM Network' => TC_ATLANTA,
      'Twin Cities Public Television' => TC_ATLANTA,
      "UNH STEM Teachers' Collaborative" => TC_PHOENIX,
      'Union Station' => TC_PHOENIX,
      'University of Nebraska' => TC_ATLANTA,
      'University of Rhode Island' => TC_PHOENIX,
      'West Virginia University' => TC_ATLANTA,
      'WNY STEM Hub' => TC_PHOENIX,
      'Women in Technology' => TC_ATLANTA
    }

    def get_matching_teachercon(regional_partner)
      return nil if regional_partner.nil?
      REGIONAL_PARTNER_TC_MAPPING[regional_partner.name]
    end

    def find_teachercon_workshop(course:, city:, year: 2018)
      Pd::Workshop.
        where(course: course, subject: Pd::Workshop::SUBJECT_TEACHER_CON).
        scheduled_start_on_or_after(Date.new(year)).
        scheduled_start_on_or_before(Date.new(year + 1)).
        where('location_address like ?', "%#{city}%").
        first
    end
  end
end
