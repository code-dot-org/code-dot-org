require 'test_helper'

class Pd::WorkshopFiltersTest < ActionController::TestCase
  freeze_time

  class FakeController < ::ApplicationController
    include Pd::WorkshopFilters
  end

  setup do
    @params = ActionController::Parameters.new
    FakeController.any_instance.stubs(params: @params)

    @user = mock
    @user.stubs(admin?: true)
    FakeController.any_instance.stubs(current_user: @user)

    @workshop_query = mock
    Pd::Workshop.stubs(:in_state).with('Ended').returns(@workshop_query)

    @controller = FakeController.new
  end

  test 'load_filtered_ended_workshops defaults' do
    set_default_date_expectations
    @controller.load_filtered_ended_workshops
  end

  test 'load_filtered_ended_workshops organizer view' do
    set_default_date_expectations
    @user.unstub :admin?
    @user.expects admin?: false
    expects(:organized_by).with(@user)
    @controller.load_filtered_ended_workshops
  end

  test 'load_filtered_ended_workshops query by start' do
    start_date = mock
    end_date = mock
    expects(:start_on_or_after).with(start_date)
    expects(:start_on_or_before).with(end_date)
    params start: start_date, end: end_date, query_by: 'schedule'
    @controller.load_filtered_ended_workshops
  end

  test 'load_filtered_ended_workshops query by end' do
    start_date = mock
    end_date = mock

    expects(:end_on_or_after).with(start_date)
    expects(:end_on_or_before).with(end_date)

    params start: start_date, end: end_date, query_by: 'end'
    @controller.load_filtered_ended_workshops
  end

  test 'load_filtered_ended_workshops include course' do
    set_default_date_expectations
    expects(:where).with(course: Pd::Workshop::COURSE_CSF)

    params course: 'csf'
    @controller.load_filtered_ended_workshops
  end

  test 'load_filtered_ended_workshops exclude course' do
    set_default_date_expectations
    expects :where
    expects(:not).with(course: Pd::Workshop::COURSE_CSF)

    params course: '-csf'
    @controller.load_filtered_ended_workshops
  end

  test 'filter_workshops default' do
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
    expects(:start_on_or_after).with(start_date)
    expects(:start_on_or_before).with(end_date)

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

  test 'filter_workshops with course' do
    expects(:where).with(course: Pd::Workshop::COURSE_CSF)
    params course: Pd::Workshop::COURSE_CSF
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with organizer id' do
    expects(:where).with(organizer: 123)
    params organizer: 123
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with date order asc' do
    expects(:order_by_start).with(desc: false)
    params date_order: 'asc'
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with date order desc' do
    expects(:order_by_start).with(desc: true)
    params date_order: 'desc'
    @controller.filter_workshops @workshop_query
  end

  test 'filter_workshops with unexpected date order defaults to asc' do
    expects(:order_by_start).with(desc: false)
    params date_order: 'garbage'
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
      :organizer,
      :date_order
    ]

    params expected_keys.map{|k| [k, 'some value']}.to_h
    assert_equal expected_keys.map(&:to_s), @controller.filter_params.keys
  end

  private

  def params(additional_params)
    @params.merge!(additional_params)
  end

  # Defaults to 1 week ending today by scheduled start date
  def set_default_date_expectations
    expects(:start_on_or_before).with(Date.today)
    expects(:start_on_or_after).with(Date.today - 1.week)
  end

  def expects(method_name)
    @workshop_query.expects(method_name).returns(@workshop_query)
  end
end
