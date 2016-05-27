require 'test_helper'

class Api::V1::Pd::DistrictReportControllerTest < ::ActionController::TestCase
  setup do
    @admin = create :admin
    @contact = create :district_contact
    @district = create :district, contact: @contact
    @other_district = create :district
    @all_districts = [@district, @other_district]
  end

  test 'admins can view the report for all districts' do
    sign_in @admin
    ::Pd::DistrictReport.expects(:generate_district_report).with(@all_districts).returns([])
    get :index
    assert_response :success
  end

  test 'district contacts can view the report for their district' do
    sign_in @contact
    ::Pd::DistrictReport.expects(:generate_district_report).with([@district]).returns([])
    get :index
    assert_response :success
  end

  test 'other users cannot view district reports' do
    # Even workshop organizers
    organizer = create :workshop_organizer
    create :pd_workshop, organizer: organizer
    sign_in organizer
    get :index
    assert_response :forbidden
  end
end
