require 'test_helper'

class Pd::WorkshopFiltersTest < ActionController::TestCase
  freeze_time

  class FakeController < ::ApplicationController
    include Pd::WorkshopFilters
  end

  setup do
    @params = {}
    FakeController.any_instance.stubs(params: @params)

    @user = mock
    @user.expects(admin?: true)
    FakeController.any_instance.stubs(current_user: @user)

    @workshop_query = mock
    Pd::Workshop.stubs(:in_state).with('Ended').returns(@workshop_query)

    @controller = FakeController.new
  end

  test 'defaults' do
    set_default_date_expectations
    @controller.load_filtered_ended_workshops
  end

  test 'organizer view' do
    set_default_date_expectations
    @user.unstub :admin?
    @user.expects admin?: false
    expects(:organized_by).with(@user)
    @controller.load_filtered_ended_workshops
  end

  test 'query by start' do
    start_date = mock
    end_date = mock
    expects(:start_on_or_after).with(start_date)
    expects(:start_on_or_before).with(end_date)
    params start: start_date, end: end_date, query_by: 'schedule'
    @controller.load_filtered_ended_workshops
  end

  test 'query by end' do
    start_date = mock
    end_date = mock

    expects(:end_on_or_after).with(start_date)
    expects(:end_on_or_before).with(end_date)

    params start: start_date, end: end_date, query_by: 'end'
    @controller.load_filtered_ended_workshops
  end

  test 'include course' do
    set_default_date_expectations
    expects(:where).with(course: Pd::Workshop::COURSE_CSF)

    params course: 'csf'
    @controller.load_filtered_ended_workshops
  end

  test 'exclude course' do
    set_default_date_expectations
    expects :where
    expects(:not).with(course: Pd::Workshop::COURSE_CSF)

    params course: '-csf'
    @controller.load_filtered_ended_workshops
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
