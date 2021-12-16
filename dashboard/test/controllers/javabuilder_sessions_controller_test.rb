require 'test_helper'

class JavabuilderSessionsControllerTest < ActionController::TestCase
  URL = "url"
  CSA_PILOT = "csa-pilot"
  CSA_PILOT_FACILITATORS = "csa-pilot-facilitators"
  CSD_PILOT = "csd-piloters"

  setup do
    @rsa_key_test = OpenSSL::PKey::RSA.new(2048)
    OpenSSL::PKey::RSA.stubs(:new).returns(@rsa_key_test)
    @fake_channel_id = storage_encrypt_channel_id(1, 1)
  end

  test_user_gets_response_for :get_access_token,
    user: :student,
    response: :forbidden
  test_user_gets_response_for :get_access_token,
    params: {channelId: storage_encrypt_channel_id(1, 1), projectVersion: 123, projectUrl: URL, executionType: 'RUN', miniAppType: 'console'},
    user: :levelbuilder,
    response: :success

  test 'can decode jwt token' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token, params: {channelId: @fake_channel_id, projectVersion: 123, projectUrl: URL, levelId: 261, executionType: 'RUN', miniAppType: 'console'}

    response = JSON.parse(@response.body)
    token = response['token']
    decoded_token = JWT.decode(token, @rsa_key_test.public_key, true, {algorithm: 'RS256'})

    # decoded_token[0] is the JWT payload. Spot check some params
    assert_not_nil decoded_token[0]['iat']
    assert_not_nil decoded_token[0]['exp']
    assert_not_nil decoded_token[0]['uid']
  end

  test 'sends options as stringified json' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token, params: {
      channelId: @fake_channel_id,
      projectVersion: 123,
      projectUrl: URL,
      executionType: 'RUN',
      options: {'useNeighborhood': true},
      miniAppType: 'console'
    }

    response = JSON.parse(@response.body)
    token = response['token']
    decoded_token = JWT.decode(token, @rsa_key_test.public_key, true, {algorithm: 'RS256'})

    # decoded_token[0] is the JWT payload. Check that options are sent as stringified json
    assert_equal "{\"useNeighborhood\":\"true\"}", decoded_token[0]['options']
  end

  test 'csa pilot participant can get access token' do
    user = create :user
    create(:single_user_experiment, min_user_id: user.id, name: CSA_PILOT)
    sign_in(user)
    get :get_access_token, params: {channelId: @fake_channel_id, projectVersion: 123, projectUrl: URL, executionType: 'RUN', miniAppType: 'console'}
    assert_response :success
  end

  test 'student of csa pilot participant can get access token' do
    teacher = create(:teacher)
    create(:single_user_experiment, min_user_id: teacher.id, name: CSA_PILOT)
    section = create(:section, user: teacher, login_type: 'word')
    student_1 = create(:follower, section: section).student_user
    sign_in(student_1)
    get :get_access_token, params: {channelId: @fake_channel_id, projectVersion: 123, projectUrl: URL, executionType: 'RUN', miniAppType: 'console'}
    assert_response :success
    section.destroy
  end

  test 'student of csa pilot facilitators participant can get access token' do
    teacher = create(:teacher)
    create(:single_user_experiment, min_user_id: teacher.id, name: CSA_PILOT_FACILITATORS)
    section = create(:section, user: teacher, login_type: 'word')
    student_1 = create(:follower, section: section).student_user
    sign_in(student_1)
    get :get_access_token, params: {channelId: @fake_channel_id, projectVersion: 123, projectUrl: URL, executionType: 'RUN', miniAppType: 'console'}
    assert_response :success
    section.destroy
  end

  test 'student of section with non-csa-pilot teacher cannot get access token' do
    teacher = create(:teacher)
    create(:single_user_experiment, min_user_id: teacher.id, name: CSD_PILOT)
    section = create(:section, user: teacher, login_type: 'word')
    student_1 = create(:follower, section: section).student_user
    sign_in(student_1)
    get :get_access_token, params: {channelId: @fake_channel_id, projectVersion: 123, projectUrl: URL, executionType: 'RUN', miniAppType: 'console'}
    assert_response :forbidden
    section.destroy
  end

  test 'param for channel id is required' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token, params: {projectVersion: 123, projectUrl: URL, executionType: 'RUN', miniAppType: 'console'}
    assert_response :bad_request
  end

  test 'param for project version is required' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token, params: {channelId: @fake_channel_id, projectUrl: URL, executionType: 'RUN', miniAppType: 'console'}
    assert_response :bad_request
  end

  test 'param project_url is required' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token, params: {channelId: @fake_channel_id, projectVersion: 123, executionType: 'RUN', miniAppType: 'console'}
    assert_response :bad_request
  end

  test 'param for execution type is required' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token, params: {channelId: @fake_channel_id, projectVersion: 123, projectUrl: URL, miniAppType: 'console'}
    assert_response :bad_request
  end

  test 'param for mini-app type is required' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token, params: {channelId: @fake_channel_id, projectVersion: 123, projectUrl: URL, executionType: 'RUN'}
    assert_response :bad_request
  end
end
