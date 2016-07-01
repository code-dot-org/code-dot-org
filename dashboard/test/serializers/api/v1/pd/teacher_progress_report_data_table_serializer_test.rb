require 'test_helper'

class Api::V1::Pd::TeacherProgressReportDataTableSerializerTest < ::ActionController::TestCase

  setup do
    @admin = create :admin
    @teacher = create :teacher, email: "teacher#{SecureRandom.hex(4)}@example.net"

    @report = [
      {
        district_name: 'District1',
        school: 'Example School',
        course: ::Pd::Workshop::COURSE_CSP,
        subject: nil,
        workshop_dates: '05/01/2016 05/03/2016',
        workshop_name: 'Workshop 05/01/16 at Code.org',
        workshop_type: ::Pd::Workshop::TYPE_PUBLIC,
        teacher_name: @teacher.name,
        teacher_id: @teacher.id,
        teacher_email: @teacher.email,
        year: '2016',
        hours: 16,
        days: 2
      }
    ]
  end

  test 'serialize' do
    expected = {
      cols: expected_cols,
      rows: [expected_row]
    }
    serialized = ::Api::V1::Pd::TeacherProgressReportDataTableSerializer.new(@report, scope: @admin).attributes
    assert_equal expected, serialized
  end

  private

  def expected_row
    {c: [
      {v: 'District1'},
      {v: 'Example School'},
      {v: ::Pd::Workshop::COURSE_CSP},
      {v: nil},
      {v: '05/01/2016 05/03/2016'},
      {v: 'Workshop 05/01/16 at Code.org'},
      {v: ::Pd::Workshop::TYPE_PUBLIC},
      {v: @teacher.name},
      {v: @teacher.id},
      {v: @teacher.email},
      {v: '2016'},
      {v: 16},
      {v: 2}
    ]}
  end

  def expected_cols
    [
      {label: 'District Name', type: 'string'},
      {label: 'School', type: 'string'},
      {label: 'Course', type: 'string'},
      {label: 'Subject', type: 'string'},
      {label: 'Workshop Dates', type: 'string'},
      {label: 'Workshop Name', type: 'string'},
      {label: 'Workshop Type', type: 'string'},
      {label: 'Teacher Name', type: 'string'},
      {label: 'Teacher Id', type: 'string'},
      {label: 'Teacher Email', type: 'string'},
      {label: 'Year', type: 'string'},
      {label: 'Hours', type: 'number'},
      {label: 'Days', type: 'number'}
    ]
  end
end
