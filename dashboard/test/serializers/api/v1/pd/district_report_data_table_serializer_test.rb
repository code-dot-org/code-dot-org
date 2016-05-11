require 'test_helper'

class Api::V1::Pd::DistrictReportDataTableSerializerTest < ::ActionController::TestCase

  setup do
    @admin = create :admin
    @organizer = create :workshop_organizer
    @section_url = "http://code.org/teacher-dashboard#/sections/#{SecureRandom.random_number(100)}"
    @teacher = create :teacher, email: "teacher#{SecureRandom.hex(4)}@example.net"

    @report = [
      {
        district_name: 'District1',
        workshop_organizer_name: @organizer.name,
        workshop_organizer_id: @organizer.id,
        facilitators: 'Facilitator1, Facilitator2',
        workshop_dates: '05/01/2016 05/03/2016',
        workshop_type: ::Pd::Workshop::TYPE_PUBLIC,
        course: ::Pd::Workshop::COURSE_CSP,
        subject: nil,
        school: 'Example School',
        teacher_name: @teacher.name,
        teacher_id: @teacher.id,
        teacher_email: @teacher.email,
        year: '2016',
        hours: 16,
        days: 2,
        payment_type: 'hourly',
        payment_rate: 4,
        qualified: true,
        payment_amount: 64
      }
    ]
  end

  test 'serialize organizer' do
    expected = {
      cols: expected_cols_organizer,
      rows: [expected_row_organizer]
    }
    serialized = ::Api::V1::Pd::DistrictReportDataTableSerializer.new(@report, scope: @organizer).attributes
    assert_equal expected, serialized
  end

  test 'serialize admin' do
    expected = {
      cols: expected_cols_admin,
      rows: [expected_row_admin]
    }
    serialized = ::Api::V1::Pd::DistrictReportDataTableSerializer.new(@report, scope: @admin).attributes
    assert_equal expected, serialized
  end

  private

  def expected_row_organizer
    {c: [
      {v: 'District1'},
      {v: @organizer.name},
      {v: @organizer.id},
      {v: 'Facilitator1, Facilitator2',},
      {v: '05/01/2016 05/03/2016'},
      {v: ::Pd::Workshop::TYPE_PUBLIC},
      {v: ::Pd::Workshop::COURSE_CSP},
      {v: nil},
      {v: 'Example School'},
      {v: @teacher.name},
      {v: @teacher.id},
      {v: @teacher.email},
      {v: '2016'},
      {v: 16},
      {v: 2}
    ]}
  end

  def expected_row_admin
    expected_row_organizer.tap do |row|
      row[:c] += [
        {v: 'hourly', f: 'hourly'},
        {v: 4, f: 4},
        {v: true, f: 'TRUE'},
        {v: 64, f: '$64.00'}
      ]
    end
  end

  def expected_cols_organizer
    [
      {label: 'District Name', type: 'string'},
      {label: 'Workshop Organizer', type: 'string'},
      {label: 'Workshop Organizer Id', type: 'string'},
      {label: 'Facilitators', type: 'string'},
      {label: 'Workshop Dates', type: 'string'},
      {label: 'Workshop Type', type: 'string'},
      {label: 'Course', type: 'string'},
      {label: 'Subject', type: 'string'},
      {label: 'School', type: 'string'},
      {label: 'Teacher Name', type: 'string'},
      {label: 'Teacher Id', type: 'string'},
      {label: 'Teacher Email', type: 'string'},
      {label: 'Year', type: 'string'},
      {label: 'Hours', type: 'number'},
      {label: 'Days', type: 'number'}
    ]
  end

  def expected_cols_admin
    expected_cols_organizer + [
      {label: 'Payment Type', type: 'string'},
      {label: 'Payment Rate', type: 'number'},
      {label: 'Qualified', type: 'boolean'},
      {label: 'Payment Amount', type: 'number'}
    ]
  end
end
