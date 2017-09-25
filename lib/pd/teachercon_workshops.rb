module Pd
  module TeacherConWorkshops
    TEACHER_CONS = [
      'June 18 - 23, 2017: Houston',
      'July 16 - 21, 2017: Phoenix',
      'July 30 - August 4, 2017: Philadelphia'
    ].freeze

    def self.teachercon?(workshop_name)
      TEACHER_CONS.any? {|tc| workshop_name.start_with? tc}
    end
  end
end
