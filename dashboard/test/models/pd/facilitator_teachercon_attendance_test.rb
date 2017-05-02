require 'test_helper'

class Pd::FacilitatorTeacherconAttendanceTest < ActiveSupport::TestCase
  test 'retrieves dates per teachercon' do
    TEST_DATE = Date.new(2017, 8, 29).freeze
    TEST_DATE_RESULT = "August 29".freeze

    just_tc1 = create :pd_facilitator_teachercon_attendance, {
      tc1_arrive: TEST_DATE,
      tc1_depart: TEST_DATE,
    }

    assert_equal(
      {
        'teachercon' => {
          arrive: TEST_DATE_RESULT,
          depart: TEST_DATE_RESULT
        }
      },
      just_tc1.attendance_dates(1)
    )
    assert_nil(just_tc1.attendance_dates(2))
    assert_nil(just_tc1.attendance_dates(3))

    tc2_fit2 = create :pd_facilitator_teachercon_attendance, {
      tc1_arrive: nil,
      tc1_depart: nil,
      tc2_arrive: TEST_DATE,
      tc2_depart: TEST_DATE,
      fit2_arrive: TEST_DATE,
      fit2_depart: TEST_DATE,
    }

    assert_nil(tc2_fit2.attendance_dates(1))
    assert_equal(
      {
        'teachercon' => {
          arrive: TEST_DATE_RESULT,
          depart: TEST_DATE_RESULT
        },
        'training' => {
          arrive: TEST_DATE_RESULT,
          depart: TEST_DATE_RESULT
        }
      },
      tc2_fit2.attendance_dates(2)
    )
    assert_nil(tc2_fit2.attendance_dates(3))

    tc3_fit1 = create :pd_facilitator_teachercon_attendance, {
      tc1_arrive: nil,
      tc1_depart: nil,
      tc3_arrive: TEST_DATE,
      tc3_depart: TEST_DATE,
      fit1_arrive: TEST_DATE,
      fit1_depart: TEST_DATE,
    }

    assert_equal(
      {
        'training' => {
          arrive: TEST_DATE_RESULT,
          depart: TEST_DATE_RESULT
        }
      },
      tc3_fit1.attendance_dates(1)
    )
    assert_nil(tc3_fit1.attendance_dates(2))
    assert_equal(
      {
        'teachercon' => {
          arrive: TEST_DATE_RESULT,
          depart: TEST_DATE_RESULT
        },
      },
      tc3_fit1.attendance_dates(3)
    )
  end
end
