require 'test_helper'

class Pd::ApplicationDashboardControllerTest < ::ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @regional_partner_program_manager = create :workshop_organizer, :as_regional_partner_program_manager
    @workshop_admin = create :workshop_admin
    @regional_partner = @regional_partner_program_manager.regional_partners.first

    # Workshop to retrieve
    @workshop_1 = create(:pd_workshop,
      :local_summer_workshop,
      regional_partner: @regional_partner,
      processed_location: {city: 'Amherst', state: 'NY'}.to_json,
      sessions_from: Date.today,
      num_sessions: 1)

    # Workshop not to retrieve because it has been ended
    create(:pd_workshop,
      :local_summer_workshop,
      regional_partner: (create :regional_partner),
      processed_location: {city: 'Chicago', state: 'IL'}.to_json,
      sessions_from: Date.today,
      num_sessions: 1,
      started_at: Date.today,
      ended_at: Date.today
    )

    # Workshop not to retrieve because it is next year
    create(:pd_workshop,
      :local_summer_workshop,
      regional_partner: @regional_partner,
      processed_location: {city: 'Philadelphia', state: 'PA'}.to_json,
      sessions_from: Date.today.next_year,
      num_sessions: 1)

    # Workshop not to retrieve because it is the wrong subject
    create(:pd_workshop,
      regional_partner: @regional_partner,
      processed_location: {city: 'Washington', state: 'DC'}.to_json,
      sessions_from: Date.today,
      num_sessions: 1)

    # Workshop not to retrieve because is for a different regional partner (but admin should retrieve)
    @workshop_2 = create(:pd_workshop,
      :local_summer_workshop,
      regional_partner: (create :regional_partner),
      processed_location: {city: 'Seattle', state: 'WA'}.to_json,
      sessions_from: Date.today,
      num_sessions: 1)
  end

  test_redirect_to_sign_in_for :index
  test_user_gets_response_for :index, user: :teacher, response: :forbidden

  test_user_gets_response_for(
    :index,
    name: 'Regional Partner program managers can see the application dashboard',
    user: -> {create :workshop_organizer, :as_regional_partner_program_manager},
    response: :success
  )

  test 'Retrieve workshops for a regional partner program manager' do
    sign_in @regional_partner_program_manager

    get :index
    response = JSON.parse(assigns(:script_data)[:props])
    assert_response :success
    assert_equal [{'label' => "#{@workshop_1.friendly_date_range}, Amherst", 'value' => @workshop_1.id}], response['summerWorkshops']
  end

  test 'Retrieve all workshops for workshop admins' do
    sign_in @workshop_admin

    get :index
    response = JSON.parse(assigns(:script_data)[:props])
    assert_response :success
    assert_equal [{'label' => "#{@workshop_1.friendly_date_range}, Amherst", 'value' => @workshop_1.id}, {'label' => "#{@workshop_2.friendly_date_range}, Seattle", 'value' => @workshop_2.id}], response['summerWorkshops']
  end
end
