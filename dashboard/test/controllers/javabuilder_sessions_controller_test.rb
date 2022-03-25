require 'test_helper'

class JavabuilderSessionsControllerTest < ActionController::TestCase
  CSA_PILOT = "csa-pilot"
  CSA_PILOT_FACILITATORS = "csa-pilot-facilitators"
  CSD_PILOT = "csd-piloters"

  setup do
    @rsa_key_test = OpenSSL::PKey::RSA.new(2048)
    OpenSSL::PKey::RSA.stubs(:new).returns(@rsa_key_test)
    @fake_channel_id = storage_encrypt_channel_id(1, 1)

    JavalabFilesHelper.stubs(:get_project_files).returns({})
    JavalabFilesHelper.stubs(:get_project_files_with_override_sources).returns({})
    JavalabFilesHelper.stubs(:get_project_files_with_override_validation).returns({})
    JavalabFilesHelper.stubs(:upload_project_files).returns(true)
  end

  test_user_gets_response_for :get_access_token,
    user: :student,
    response: :forbidden
  test_user_gets_response_for :get_access_token,
    params: {channelId: storage_encrypt_channel_id(1, 1), executionType: 'RUN', miniAppType: 'console'},
    user: :levelbuilder,
    response: :success

  test_user_gets_response_for :get_access_token_with_override_sources,
    user: :student,
    response: :forbidden
  test_user_gets_response_for :get_access_token_with_override_sources,
    user: :teacher,
    response: :forbidden
  test_user_gets_response_for :get_access_token_with_override_sources,
    params: {overrideSources: "{'source': {}}", executionType: 'RUN', miniAppType: 'console'},
    user: :levelbuilder,
    response: :success

  test_user_gets_response_for :get_access_token_with_override_validation,
    user: :student,
    response: :forbidden
  test_user_gets_response_for :get_access_token_with_override_validation,
    user: :teacher,
    response: :forbidden
  test_user_gets_response_for :get_access_token_with_override_validation,
    params: {channelId: storage_encrypt_channel_id(1, 1), overrideValidation: "{'MyClass.java': {}}", executionType: 'RUN', miniAppType: 'console'},
    user: :levelbuilder,
    response: :success

  test 'can decode jwt token' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token, params: {channelId: @fake_channel_id, levelId: 261, executionType: 'RUN', miniAppType: 'console'}

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
    get :get_access_token, params: {channelId: @fake_channel_id, executionType: 'RUN', miniAppType: 'console'}
    assert_response :success
  end

  test 'student of csa pilot participant can get access token' do
    teacher = create(:teacher)
    create(:single_user_experiment, min_user_id: teacher.id, name: CSA_PILOT)
    section = create(:section, user: teacher, login_type: 'word')
    student_1 = create(:follower, section: section).student_user
    sign_in(student_1)
    get :get_access_token, params: {channelId: @fake_channel_id, executionType: 'RUN', miniAppType: 'console'}
    assert_response :success
    section.destroy
  end

  test 'student of csa pilot facilitators participant can get access token' do
    teacher = create(:teacher)
    create(:single_user_experiment, min_user_id: teacher.id, name: CSA_PILOT_FACILITATORS)
    section = create(:section, user: teacher, login_type: 'word')
    student_1 = create(:follower, section: section).student_user
    sign_in(student_1)
    get :get_access_token, params: {channelId: @fake_channel_id, executionType: 'RUN', miniAppType: 'console'}
    assert_response :success
    section.destroy
  end

  test 'student of section with non-csa-pilot teacher cannot get access token' do
    teacher = create(:teacher)
    create(:single_user_experiment, min_user_id: teacher.id, name: CSD_PILOT)
    section = create(:section, user: teacher, login_type: 'word')
    student_1 = create(:follower, section: section).student_user
    sign_in(student_1)
    get :get_access_token, params: {channelId: @fake_channel_id, executionType: 'RUN', miniAppType: 'console'}
    assert_response :forbidden
    section.destroy
  end

  test 'param for channel id is required' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token, params: {executionType: 'RUN', miniAppType: 'console'}
    assert_response :bad_request
  end

  test 'param for override sources is required when using override sources route' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token_with_override_sources, params: {executionType: 'RUN', miniAppType: 'console'}
    assert_response :bad_request
  end

  test 'param for override validation is required when using override validation route' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token_with_override_validation, params: {executionType: 'RUN', miniAppType: 'console'}
    assert_response :bad_request
  end

  test 'param for execution type is required' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token, params: {channelId: @fake_channel_id, miniAppType: 'console'}
    assert_response :bad_request
  end

  test 'param for mini-app type is required' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token, params: {channelId: @fake_channel_id, executionType: 'RUN'}
    assert_response :bad_request
  end

  test 'returns error if upload fails' do
    JavalabFilesHelper.stubs(:upload_project_files).returns(false)
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token, params: {channelId: @fake_channel_id, levelId: 261, executionType: 'RUN', miniAppType: 'console'}
    assert_response :internal_server_error
  end

  test 'student of csa-pilot and verified teacher has correct verified_teachers parameter' do
    teacher = create(:teacher)
    create(:single_user_experiment, min_user_id: teacher.id, name: CSA_PILOT_FACILITATORS)
    section_1 = create(:section, user: teacher, login_type: 'word')
    verified_teacher = create(:teacher)
    verified_teacher.permission = UserPermission::AUTHORIZED_TEACHER
    section_2 = create(:section, user: verified_teacher, login_type: 'word')
    student_1 = create(:follower, section: section_1).student_user
    create(:follower, section: section_2, student_user: student_1)
    regular_teacher = create(:teacher)
    section_3 = create(:section, user: regular_teacher, login_type: 'word')
    create(:follower, section: section_3, student_user: student_1)

    sign_in(student_1)
    get :get_access_token, params: {channelId: @fake_channel_id, executionType: 'RUN', miniAppType: 'console'}
    assert_response :success

    response = JSON.parse(@response.body)
    token = response['token']
    decoded_token = JWT.decode(token, @rsa_key_test.public_key, true, {algorithm: 'RS256'})

    teachers_string = decoded_token[0]['verified_teachers']
    teachers = teachers_string.split(',')
    assert_equal 2, teachers.length
    assert teachers.include?((teacher.id).to_s)
    assert teachers.include?((verified_teacher.id).to_s)
    refute teachers.include?((regular_teacher.id).to_s)

    section_1.destroy
    section_2.destroy
  end

  test 'levelbuilder has correct verified_teachers parameter' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token, params: {channelId: @fake_channel_id, levelId: 261, executionType: 'RUN', miniAppType: 'console'}

    response = JSON.parse(@response.body)
    token = response['token']
    decoded_token = JWT.decode(token, @rsa_key_test.public_key, true, {algorithm: 'RS256'})
    teachers_string = decoded_token[0]['verified_teachers']
    assert_equal (levelbuilder.id).to_s, teachers_string
  end
end
