require 'test_helper'

class Api::V1::Pd::WorkshopOrganizerReportDataTableSerializerTest < ::ActionController::TestCase

  setup do
    @admin = create :admin
    @organizer = create :workshop_organizer, email: "organizer#{SecureRandom.hex(4)}@example.net"
    @section_url = "http://code.org/teacher-dashboard#/sections/#{SecureRandom.random_number(100)}"

    @report = [
      {
        organizer_name: @organizer.name,
        organizer_id: @organizer.id,
        organizer_email: @organizer.email,
        workshop_dates: '05/01/2016 05/03/2016',
        workshop_type: ::Pd::Workshop::TYPE_PUBLIC,
        section_url: @section_url,
        facilitators: 'Facilitator1, Facilitator2',
        num_facilitators: 2,
        workshop_name: 'Workshop 05/01/16 at Code.org',
        course: ::Pd::Workshop::COURSE_CSP,
        subject: nil,
        num_teachers: 10,
        days: 2,
        payment_type: 'PLP Urban',
        qualified: true,
        teacher_payment: 150,
        facilitator_payment: 1250,
        staffer_payment: 500,
        venue_payment: 1000,
        payment_total: 2900
      }
    ]
  end

  test 'serialize non-admin' do
    expected = {
      cols: expected_cols_organizer,
      rows: [expected_row_organizer]
    }
    serialized = ::Api::V1::Pd::WorkshopOrganizerReportDataTableSerializer.new(@report, scope: @organizer).attributes
    assert_equal expected, serialized
  end

  test 'serialize admin' do
    expected = {
      cols: expected_cols_admin,
      rows: [expected_row_admin]
    }
    serialized = ::Api::V1::Pd::WorkshopOrganizerReportDataTableSerializer.new(@report, scope: @admin).attributes
    assert_equal expected, serialized
  end

  private

  def expected_row_organizer
    {c: [
      {v: @organizer.name},
      {v: @organizer.id},
      {v: @organizer.email},
      {v: '05/01/2016 05/03/2016'},
      {v: ::Pd::Workshop::TYPE_PUBLIC},
      {v: @section_url, f: "<a href=#{@section_url}>#{@section_url}</a>"},
      {v: 'Facilitator1, Facilitator2'},
      {v: 2},
      {v: 'Workshop 05/01/16 at Code.org'},
      {v: ::Pd::Workshop::COURSE_CSP},
      {v: nil},
      {v: 10},
      {v: 2}
    ]}
  end

  def expected_row_admin
    expected_row_organizer.tap do |row|
      row[:c] += [
        {v: 'PLP Urban'},
        {v: true, f: 'TRUE'},
        {v: 150, f: '$150.00'},
        {v: 1250, f: '$1250.00'},
        {v: 500, f: '$500.00'},
        {v: 1000, f: '$1000.00'},
        {v: 2900, f: '$2900.00'}
      ]
    end
  end

  def expected_cols_organizer
    [
      {label: 'Organizer Name', type: 'string'},
      {label: 'Organizer Id', type: 'string'},
      {label: 'Organizer Email', type: 'string'},
      {label: 'Workshop Dates', type: 'string'},
      {label: 'Workshop Type', type: 'string'},
      {label: 'Section Url', type: 'string'},
      {label: 'Facilitators', type: 'string'},
      {label: 'Num Facilitators', type: 'number'},
      {label: 'Workshop Name', type: 'string'},
      {label: 'Course', type: 'string'},
      {label: 'Subject', type: 'string'},
      {label: 'Num Teachers', type: 'number'},
      {label: 'Days', type: 'number'}
    ]
  end

  def expected_cols_admin
    expected_cols_organizer + [
      {label: 'Payment Type', type: 'string'},
      {label: 'Qualified', type: 'boolean'},
      {label: 'Teacher Payment', type: 'number'},
      {label: 'Facilitator Payment', type: 'number'},
      {label: 'Staffer Payment', type: 'number'},
      {label: 'Venue Payment', type: 'number'},
      {label: 'Payment Total', type: 'number'}
    ]
  end
end
