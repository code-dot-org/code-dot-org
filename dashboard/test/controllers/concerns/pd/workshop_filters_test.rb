require 'test_helper'

class Pd::WorkshopFiltersTest < ActionController::TestCase
  freeze_time

  class FakeController < ::ApplicationController
    include ::Pd::WorkshopFilters
  end

  setup do
    @params = ActionController::Parameters.new
    FakeController.any_instance.stubs(params: @params)

    @user = mock
    @user.stubs(permission?: true)
    FakeController.any_instance.stubs(current_user: @user)

    @workshop_query = mock
    @controller = FakeController.new
  end

  test 'load_filtered_ended_workshops defaults' do
    set_default_date_expectations
    load_filtered_ended_workshops
  end

  test 'load_filtered_ended_workshops organizer view' do
    set_default_date_expectations
    @user.expects permission?: false
    expects(:organized_by).with(@user)
    load_filtered_ended_workshops
  end

  test 'load_filtered_ended_workshops query by start' do
    start_date = mock
    end_date = mock
    expects(:scheduled_start_on_or_after).with(start_date)
    expects(:scheduled_start_on_or_before).with(end_date)
    params start: start_date, end: end_date, query_by: 'schedule'
    load_filtered_ended_workshops
  end

  test 'load_filtered_ended_workshops query by end' do
    start_date = mock
    end_date = mock
    expects(:end_on_or_after).with(start_date)
    expects(:end_on_or_before).with(end_date)

    params start: start_date, end: end_date, query_by: 'end'
    load_filtered_ended_workshops
  end

  test 'load_filtered_ended_workshops include course' do
    set_default_date_expectations
    expects(:where).with(course: Pd::Workshop::COURSE_CSF)

    params course: 'csf'
    load_filtered_ended_workshops
  end

  test 'load_filtered_ended_workshops exclude course' do
    set_default_date_expectations
    expects :where
    expects(:not).with(course: Pd::Workshop::COURSE_CSF)

    params course: '-csf'
    load_filtered_ended_workshops
  end

  test 'filter_workshops default' do
    # Since @workshop_query is a mock with no expectations, this verifies that no filters are applied.
    # It will fail with "Minitest::Assertion: unexpected invocation" if any calls are made to @workshop_query.
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with state' do
    expects(:in_state).with('Not Started', error_on_bad_state: false)
    params state: 'Not Started'
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with start and end' do
    start_date = Date.today.to_s
    end_date = (Date.today + 1.day).to_s
    expects(:scheduled_start_on_or_after).with(start_date)
    expects(:scheduled_start_on_or_before).with(end_date)

    params start: start_date, end: end_date
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with invalid start date raises error' do
    params start: 'invalid'
    assert_raises ArgumentError do
      @controller.filter_workshops @workshop_query
    end
  end

  test 'filter_workshops with invalid end date raises error' do
    params end: 'invalid'
    assert_raises ArgumentError do
      @controller.filter_workshops @workshop_query
    end
  end

  test 'filter_workshops with unparseable order_by raises error' do
    params order_by: 'this is too many words'
    e = assert_raises ArgumentError do
      @controller.filter_workshops @workshop_query
    end
    assert e.message.start_with? 'Unable to parse order_by param:'
  end

  test 'filter_workshops with invalid order_by raises error' do
    params order_by: 'invalid'
    e = assert_raises ArgumentError do
      @controller.filter_workshops @workshop_query
    end
    assert e.message.start_with? 'Invalid order_by field:'
  end

  test 'filter_workshops with course' do
    expects(:where).with(course: Pd::Workshop::COURSE_CSF)
    params course: Pd::Workshop::COURSE_CSF
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with subject' do
    expects(:where).with(subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP)
    params subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with virtual status' do
    params virtual: 'yes'

    # No virtual workshops found, uses none to return empty set of records.
    @workshop_query.expects(:select).returns([])
    expects(:none)

    @controller.filter_workshops @workshop_query

    virtual_workshop = create :workshop,
      virtual: true,
      suppress_email: true

    # Need to override expects method used elsewhere in this test file
    # to set the return value to an array, instead of the mock @workshop_query
    # object.
    @workshop_query.expects(:select).returns([virtual_workshop])
    expects(:where).with(id: [virtual_workshop.id])

    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with facilitator_id' do
    User.stubs(:find_by).with(id: 789).returns(@user)
    expects(:facilitated_by).with(@user)
    params facilitator_id: 789
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with organizer id' do
    expects(:where).with(organizer_id: 123)
    params organizer_id: 123
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with teacher_email' do
    teacher = create :teacher, email: "test@example.net"
    expects(:enrolled_in_by).with(teacher)
    params teacher_email: teacher.email
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with teacher_email and only_attended' do
    teacher = create :teacher, email: "test@example.net"
    expects(:attended_by).with(teacher)
    params teacher_email: teacher.email
    params only_attended: true
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with regional_partner_id' do
    expects(:where).with(regional_partner_id: 1)
    params regional_partner_id: 1
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with regional_partner_id set to none' do
    expects(:where).with(regional_partner_id: nil)
    params regional_partner_id: 'none'
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with regional_partner_id unset' do
    expects(:where).never
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with regional_partner_id set to all' do
    expects(:where).never
    params regional_partner_id: 'all'
    @controller.filter_workshops @workshop_query
  end

  # Normal sort fields
  %w(location_name on_map funded course subject).each do |sort_field|
    test "filter_workshops with order_by #{sort_field}" do
      expects(:order).with(sort_field)
      params order_by: sort_field
      @controller.filter_workshops @workshop_query
    end

    test "filter_workshops with order_by #{sort_field} desc" do
      expects(:order).with(sort_field + ' desc')
      params order_by: sort_field + ' desc'
      @controller.filter_workshops @workshop_query
    end
  end

  # Specialty sort fields
  test 'filter_workshops with order_by date' do
    expects(:order_by_scheduled_start).with(desc: false)
    params order_by: 'date'
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with order_by date desc' do
    expects(:order_by_scheduled_start).with(desc: true)
    params order_by: 'date desc'
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with order_by enrollments' do
    expects(:order_by_enrollment_count).with(desc: false)
    params order_by: 'enrollments'
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with order_by enrollments desc' do
    expects(:order_by_enrollment_count).with(desc: true)
    params order_by: 'enrollments desc'
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with order_by state' do
    expects(:order_by_state).with(desc: false)
    params order_by: 'state'
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with order_by state desc' do
    expects(:order_by_state).with(desc: true)
    params order_by: 'state desc'
    @controller.filter_workshops @workshop_query
  end

  test 'filter_params contains only supplied params' do
    params state: Pd::Workshop::STATE_IN_PROGRESS, course: Pd::Workshop::COURSE_CSF
    assert_equal %w[state course], @controller.filter_params.keys
  end

  test 'filter_params does not contain unexpected params' do
    params unexpected: 'irrelevant'
    assert_empty @controller.filter_params.keys
  end

  test 'filter_params accepts all filters' do
    expected_keys = [
      :state,
      :start,
      :end,
      :course,
      :subject,
      :virtual,
      :organizer_id,
      :teacher_email,
      :only_attended,
      :order_by,
    ]

    params expected_keys.map {|k| [k, 'some value']}.to_h
    assert_equal expected_keys.map(&:to_s), @controller.filter_params.keys
  end

  private

  def params(additional_params)
    @params.merge!(additional_params)
  end

  # Sets up expectation for Pd::Workshop.in_state('Ended') to return the mocked @workshop_query and calls
  # @controller.load_filtered_ended_workshops
  def load_filtered_ended_workshops
    Pd::Workshop.expects(:in_state).with('Ended').returns(@workshop_query)
    @controller.load_filtered_ended_workshops
  end

  # Defaults to 1 week ending today by scheduled start date
  def set_default_date_expectations
    expects(:scheduled_start_on_or_before).with(Date.today)
    expects(:scheduled_start_on_or_after).with(Date.today - 1.week)
  end

  def expects(method_name)
    @workshop_query.expects(method_name).returns(@workshop_query)
  end
end
