require 'test_helper'

class AdminPilotsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @admin = create(:admin)
    sign_in(@admin)

    @not_admin = create(:user, username: 'notadmin')
  end

  #
  # create tests
  #
  test 'non-admin cannot create pilot' do
    sign_in @not_admin
    post :create, params: {
      pilot: {
        name: 'test-pilot-1',
        display_name: 'Test Pilot 1',
        allow_joining_via_url: true
      }
    }
    assert_response :forbidden
  end

  test 'admin can create pilot' do
    post :create, params: {
      pilot: {
        name: 'test-pilot-2',
        display_name: 'Test Pilot 2',
        allow_joining_via_url: true
      }
    }
    assert_response :redirect

    pilot = Pilot.find_by(name: 'test-pilot-2')
    assert pilot
    assert_equal 'test-pilot-2', pilot.name
    assert_equal 'Test Pilot 2', pilot.display_name
    assert_equal true, pilot.allow_joining_via_url
  end

  test 'create pilot with empty params fails' do
    post :create, params: {}
    assert_response :bad_request
  end

  test 'create pilot with invalid name fails' do
    post :create, params: {
      pilot: {
        name: 'TestPilot1',
        display_name: 'Test Pilot 1',
        allow_joining_via_url: true
      }
    }
    assert_response :bad_request
  end

  test 'create pilot with missing display_name fails' do
    post :create, params: {
      pilot: {
        name: 'test-pilot-1',
        allow_joining_via_url: true
      }
    }
    assert_response :bad_request
  end

  #
  # show pilot tests
  #

  test 'non-admin cannot view list of piloters' do
    sign_in @not_admin
    get :show, params: {pilot_name: 'csp-piloters'}
    assert_response :forbidden
  end

  test 'piloter shows up in list of piloters' do
    pilot1 = create(:pilot)
    pilot2 = create(:pilot)
    create(:teacher, pilot_experiment: pilot1.name, email: 'csp@example.com')
    create(:teacher, pilot_experiment: pilot2.name, email: 'cspnot@example.com')
    get :show, params: {pilot_name: pilot1.name}
    assert_response :success
    assert_select 'table tr td.email', {count: 1, text: "csp@example.com"}
    assert_select 'table tr td.actions form input.btn-primary', 1
  end

  #
  # add_to_pilot tests
  #

  test 'can add and remove teacher from pilot' do
    teacher = create(:teacher)
    pilot_name = create(:pilot).name
    post :add_to_pilot, params: {email: teacher.email, pilot_name: pilot_name}

    assert SingleUserExperiment.find_by(min_user_id: teacher.id, name: pilot_name).present?

    post :remove_from_pilot, params: {email: teacher.email, pilot_name: pilot_name}

    refute SingleUserExperiment.find_by(min_user_id: teacher.id, name: pilot_name).present?
  end

  test 'can add multiple teachers to pilot' do
    teacher = create(:teacher)
    teacher2 = create(:teacher)
    pilot_name = create(:pilot).name
    post :add_to_pilot, params: {email: teacher.email + "\n" + teacher2.email, pilot_name: pilot_name}

    assert SingleUserExperiment.find_by(min_user_id: teacher.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher2.id, name: pilot_name).present?
  end

  test 'can add multiple teachers to pilot with extra spaces' do
    teacher = create(:teacher)
    teacher2 = create(:teacher)
    pilot_name = create(:pilot).name
    post :add_to_pilot, params: {email: teacher.email + " \n" + teacher2.email, pilot_name: pilot_name}

    assert SingleUserExperiment.find_by(min_user_id: teacher.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher2.id, name: pilot_name).present?
  end

  test 'can add multiple teachers to pilot with extra commas' do
    teacher = create(:teacher)
    teacher2 = create(:teacher)
    pilot_name = create(:pilot).name
    post :add_to_pilot, params: {email: teacher.email + ",\n" + teacher2.email, pilot_name: pilot_name}

    assert SingleUserExperiment.find_by(min_user_id: teacher.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher2.id, name: pilot_name).present?
  end

  test 'if first email fails, second given will work successfully' do
    student = create(:student)
    teacher = create(:teacher)
    pilot_name = create(:pilot).name
    post :add_to_pilot, params: {email: student.email + "\n" + teacher.email, pilot_name: pilot_name}

    refute SingleUserExperiment.find_by(min_user_id: student.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher.id, name: pilot_name).present?
  end

  test 'if middle user is not found, first and third still work successfully' do
    teacher = create(:teacher)
    teacher2 = create(:teacher)
    pilot_name = create(:pilot).name
    post :add_to_pilot, params: {
      email: teacher.email + "\nfake@fakey1.fake\n" + teacher2.email, pilot_name: pilot_name
    }

    assert SingleUserExperiment.find_by(min_user_id: teacher.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher2.id, name: pilot_name).present?
  end

  test 'longer list of emails works correctly' do
    teacher = create(:teacher)
    teacher2 = create(:teacher)
    teacher3 = create(:teacher)
    teacher4 = create(:teacher)
    teacher5 = create(:teacher)
    teacher6 = create(:teacher)
    teacher7 = create(:teacher)
    teacher8 = create(:teacher)
    teacher9 = create(:teacher)
    teacher10 = create(:teacher)
    teacher11 = create(:teacher)
    pilot_name = create(:pilot).name
    post :add_to_pilot, params: {
      email: teacher.email + "\n" + teacher2.email + "\n" + teacher3.email + "\n" +
        teacher4.email + "\n" + teacher5.email + "\n" + teacher6.email + "\n" +
        teacher7.email + "\n" + teacher8.email + "\n" + teacher9.email + "\n" +
        teacher10.email + "\n" + teacher11.email, pilot_name: pilot_name
    }

    assert SingleUserExperiment.find_by(min_user_id: teacher.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher2.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher3.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher6.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher9.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher10.id, name: pilot_name).present?
    assert SingleUserExperiment.find_by(min_user_id: teacher11.id, name: pilot_name).present?
  end

  test 'cannot add student to pilot' do
    student = create(:student)
    pilot_name = 'csp-piloters'
    post :add_to_pilot, params: {email: student.email, pilot_name: pilot_name}

    refute SingleUserExperiment.find_by(min_user_id: student.id, name: pilot_name).present?
  end

  test 'non-admin cannot add teacher to pilot' do
    teacher = create(:teacher)
    pilot_name = 'csp-piloters'

    sign_in @not_admin
    post :add_to_pilot, params: {email: teacher.email, pilot_name: pilot_name}

    refute SingleUserExperiment.find_by(min_user_id: teacher.id, name: pilot_name).present?
  end
end
