require_relative '../test_helper'
require 'pd/teachercon_workshops'

module Pd
  class TeacherConWorkshopsTest < Minitest::Test
    def test_teachercon
      teachercons = [
        'July 16 - 21, 2017: Phoenix',
        'June 18 - 23, 2017: Houston (travel expenses paid)'
      ]

      teachercons.each do |teachercon|
        assert(
          TeacherConWorkshops.teachercon?(teachercon),
          "Expected workshop name #{teachercon} to be a teachercon"
        )
      end
    end

    def test_not_teachercon
      non_teachercons = [
        'Code Parther : July 1 - July 5, 2017',
        'not teachercon',
        'another workshop in: Phoenix',
      ]

      non_teachercons.each do |non_teachercon|
        refute(
          TeacherConWorkshops.teachercon?(non_teachercon),
          "Expected workshop name #{non_teachercon} to not be a teachercon"
        )
      end
    end
  end
end
