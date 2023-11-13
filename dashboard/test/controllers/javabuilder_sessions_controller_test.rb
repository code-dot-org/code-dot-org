require 'test_helper'

class JavabuilderSessionsControllerTest < ActionController::TestCase
  setup do
    @rsa_key_test = OpenSSL::PKey::RSA.new(2048)
    OpenSSL::PKey::RSA.stubs(:new).returns(@rsa_key_test)
    @fake_channel_id = storage_encrypt_channel_id(1, 1)

    JavalabFilesHelper.stubs(:get_project_files).returns({})
    JavalabFilesHelper.stubs(:get_project_files_with_override_sources).returns({})
    JavalabFilesHelper.stubs(:get_project_files_with_override_validation).returns({})
    put_response = Net::HTTPResponse.new(nil, '200', nil)
    JavalabFilesHelper.stubs(:upload_project_files).returns(put_response)
  end

  test_user_gets_response_for :get_access_token,
    user: :student,
    response: :forbidden
  test_user_gets_response_for :get_access_token,
    params: {channelId: storage_encrypt_channel_id(1, 1), executionType: 'RUN', miniAppType: 'console'},
    user: :with_recent_captcha_teacher,
    response: :success
  test_user_gets_response_for :get_access_token,
    params: {channelId: storage_encrypt_channel_id(1, 1), executionType: 'RUN', miniAppType: 'console'},
    user: :levelbuilder,
    response: :success
  test_user_gets_response_for :get_access_token,
    params: {channelId: storage_encrypt_channel_id(1, 1), executionType: 'RUN', miniAppType: 'console'},
    user: :authorized_teacher,
    response: :success

  test_user_gets_response_for :access_token_with_override_sources,
    method: :post,
    user: :student,
    response: :forbidden
  test_user_gets_response_for :access_token_with_override_sources,
    method: :post,
    params: {overrideSources: "{'source': {}}", executionType: 'RUN', miniAppType: 'console'},
    user: :with_recent_captcha_teacher,
    response: :success
  test_user_gets_response_for :access_token_with_override_sources,
    method: :post,
    params: {overrideSources: "{'source': {}}", executionType: 'RUN', miniAppType: 'console'},
    user: :levelbuilder,
    response: :success
  test_user_gets_response_for :access_token_with_override_sources,
    method: :post,
    params: {overrideSources: "{'source': {}}", executionType: 'RUN', miniAppType: 'console'},
    user: :authorized_teacher,
    response: :success

  test_user_gets_response_for :access_token_with_override_validation,
    method: :post,
    user: :student,
    response: :forbidden
  test_user_gets_response_for :access_token_with_override_validation,
    method: :post,
    user: :teacher,
    response: :forbidden
  test_user_gets_response_for :access_token_with_override_validation,
    method: :post,
    user: :authorized_teacher,
    response: :forbidden
  test_user_gets_response_for :access_token_with_override_validation,
    method: :post,
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
    refute_nil decoded_token[0]['iat']
    refute_nil decoded_token[0]['exp']
    refute_nil decoded_token[0]['uid']
  end

  test 'sends options as stringified json' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token, params: {
      channelId: @fake_channel_id,
      executionType: 'RUN',
      options: {useNeighborhood: true},
      miniAppType: 'console'
    }

    response = JSON.parse(@response.body)
    token = response['token']
    decoded_token = JWT.decode(token, @rsa_key_test.public_key, true, {algorithm: 'RS256'})

    # decoded_token[0] is the JWT payload. Check that options are sent as stringified json
    assert_equal "{\"useNeighborhood\":\"true\"}", decoded_token[0]['options']
  end

  test 'response for verified teacher includes javabuilder url' do
    verified_teacher = create(:authorized_teacher)
    sign_in(verified_teacher)

    get :get_access_token, params: {channelId: @fake_channel_id, executionType: 'RUN', miniAppType: 'console'}
    response = JSON.parse(@response.body)

    assert_equal(CDO.javabuilder_url, response['javabuilder_url'])
  end

  test 'response for unverified teacher includes demo javabuilder url' do
    teacher = create(:with_recent_captcha_teacher)
    sign_in(teacher)

    get :get_access_token, params: {channelId: @fake_channel_id, executionType: 'RUN', miniAppType: 'console'}
    response = JSON.parse(@response.body)

    assert_equal(CDO.javabuilder_demo_url, response['javabuilder_url'])
  end

  test 'student of authorized teacher without csa section cannot get access token' do
    teacher = create(:authorized_teacher)
    section = create(:section, user: teacher, login_type: 'word')
    student_1 = create(:follower, section: section).student_user
    sign_in(student_1)
    get :get_access_token, params: {channelId: @fake_channel_id, executionType: 'RUN', miniAppType: 'console'}
    assert_response :forbidden
  end

  test 'student not in the authorized teachers csa section cannot get access token' do
    csa_script = create(:csa_script)
    teacher = create(:authorized_teacher)
    section = create(:section, user: teacher, login_type: 'word')
    create(:section, user: teacher, login_type: 'word', script: csa_script)
    student_1 = create(:follower, section: section).student_user
    sign_in(student_1)
    get :get_access_token, params: {channelId: @fake_channel_id, executionType: 'RUN', miniAppType: 'console'}
    assert_response :forbidden
  end

  test 'student of authorized teacher in csa section can get access token' do
    teacher = create(:authorized_teacher)
    csa_script = create(:csa_script)
    section = create(:section, user: teacher, login_type: 'word', script: csa_script)
    student_1 = create(:follower, section: section).student_user
    sign_in(student_1)
    get :get_access_token, params: {channelId: @fake_channel_id, executionType: 'RUN', miniAppType: 'console'}
    assert_response :success
  end

  test 'student of non-authorized teacher cannot get access token' do
    teacher = create(:teacher)
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
    post :access_token_with_override_sources, params: {executionType: 'RUN', miniAppType: 'console'}
    assert_response :bad_request
  end

  test 'param for override validation is required when using override validation route' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    post :access_token_with_override_validation, params: {executionType: 'RUN', miniAppType: 'console'}
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
    JavalabFilesHelper.stubs(:upload_project_files).returns(nil)
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token, params: {channelId: @fake_channel_id, levelId: 261, executionType: 'RUN', miniAppType: 'console'}
    assert_response :internal_server_error
  end

  test 'student of verified teacher has correct verified_teachers parameter' do
    csa_script = create(:csa_script)
    verified_teacher_1 = create(:authorized_teacher)
    csa_section = create(:section, user: verified_teacher_1, login_type: 'word', script: csa_script)
    verified_teacher_2 = create(:authorized_teacher)
    section_1 = create(:section, user: verified_teacher_2, login_type: 'word')
    student_1 = create(:follower, section: csa_section).student_user
    create(:follower, section: section_1, student_user: student_1)
    # have verified teacher 2 also teach a csa section which student 1 is not assigned to.
    create(:section, user: verified_teacher_2, login_type: 'word', script: csa_script)
    regular_teacher = create(:teacher)
    section_2 = create(:section, user: regular_teacher, login_type: 'word')
    create(:follower, section: section_2, student_user: student_1)

    sign_in(student_1)
    get :get_access_token, params: {channelId: @fake_channel_id, executionType: 'RUN', miniAppType: 'console'}
    assert_response :success

    response = JSON.parse(@response.body)
    token = response['token']
    decoded_token = JWT.decode(token, @rsa_key_test.public_key, true, {algorithm: 'RS256'})

    teachers_string = decoded_token[0]['verified_teachers']
    teachers = teachers_string.split(',')
    assert_equal 1, teachers.length
    assert_includes(teachers, (verified_teacher_1.id).to_s)
    # verified teacher 2 is not teaching the student csa
    refute teachers.include?((verified_teacher_2.id).to_s)
    refute teachers.include?((regular_teacher.id).to_s)
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

  test 'regular teacher account has correct verified_teachers parameter (supports javalab eval mode)' do
    teacher = create :with_recent_captcha_teacher
    sign_in(teacher)
    get :get_access_token, params: {channelId: @fake_channel_id, levelId: 261, executionType: 'RUN', miniAppType: 'console'}

    response = JSON.parse(@response.body)
    token = response['token']
    decoded_token = JWT.decode(token, @rsa_key_test.public_key, true, {algorithm: 'RS256'})
    teachers_string = decoded_token[0]['verified_teachers']
    assert_equal (teacher.id).to_s, teachers_string
  end

  test 'regular teacher who has never verified via captcha gets prompted for captcha' do
    teacher = create :teacher
    sign_in(teacher)
    get :get_access_token, params: {channelId: @fake_channel_id, levelId: 261, executionType: 'RUN', miniAppType: 'console'}

    assert_response :forbidden
    response = JSON.parse(@response.body)
    assert_equal(true, response['captcha_required'])
  end

  test 'regular teacher who has verified via captcha more than 24 hours ago gets prompted for captcha' do
    teacher = create :teacher, last_verified_captcha_at: Time.now.utc - 25.hours
    sign_in(teacher)
    get :get_access_token, params: {channelId: @fake_channel_id, levelId: 261, executionType: 'RUN', miniAppType: 'console'}

    assert_response :forbidden
    response = JSON.parse(@response.body)
    assert_equal(true, response['captcha_required'])
  end
end
