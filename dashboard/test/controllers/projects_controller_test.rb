require 'test_helper'
require 'webmock/minitest'

class ProjectsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  # Sign in, and stub request.user_id to return the signed in user's id
  def sign_in_with_request(user)
    sign_in user
    ActionDispatch::TestRequest.any_instance.stubs(:user_id).returns(user.id)
  end

  setup do
    sign_in_with_request create :user
    Geocoder.stubs(:search).returns([OpenStruct.new(country_code: 'US')])
    AzureTextToSpeech.stubs(:get_voices).returns({})
  end

  self.use_transactional_test_case = true

  setup_all do
    # Create placeholder levels for the standalone project pages.
    # Note that all this does is create blank levels with appropriate names; it
    # doesn't set them up as actual project template levels, much less give
    # them specific content.
    ProjectsController::STANDALONE_PROJECTS.each do |type, config|
      next if Level.exists?(name: config[:name])
      factory = FactoryBot.factories.registered?(type) ? type : :level
      create(factory, name: config[:name])
    end

    @driver = create :user
    @navigator = create :user
    @section = create :section
    @section.add_student @driver
    @section.add_student @navigator
  end

  teardown do
    AzureTextToSpeech.unstub(:get_voices)
  end

  test 'on lab2 levels navigating to /edit redirects to /view if user is not project owner' do
    channel_id = '12345'
    Projects.any_instance.stubs(:get).returns({isOwner: false})

    get :edit, params: {path: "/projects/music/#{channel_id}/edit", key: 'music', channel_id: channel_id}
    assert_response :redirect
    assert_redirected_to "/projects/music/#{channel_id}/view"
  end

  test 'on lab2 levels navigating to /edit redirects to /view if project is frozen' do
    channel_id = '12345'
    Projects.any_instance.stubs(:get).returns({isFrozen: true})

    get :edit, params: {path: "/projects/music/#{channel_id}/edit", key: 'music', channel_id: channel_id}
    assert_response :redirect
    assert_redirected_to "/projects/music/#{channel_id}/view"
  end

  test 'submission status returns appropriate status' do
    channel_id = '123456'
    @controller.stubs(:storage_decrypt_channel_id).returns([123, 456])
    test_project = {}
    Project.stubs(:find_by).returns(test_project)
    SharedConstants::PROJECT_SUBMISSION_STATUS.each_value do |status|
      test_project.stubs(:submission_status).returns(status)
      get :submission_status, params: {project_type: 'music', channel_id: channel_id}
      assert_response :success
      response_status = JSON.parse(@response.body)["status"]
      assert_equal response_status, status
    end
  end

  test 'submit project returns bad_request if no submission description' do
    channel_id = '123456'
    submission_description = ''
    post :submit, params: {project_type: 'music', channel_id: channel_id, submissionDescription: submission_description}
    assert_response :bad_request
  end

  test 'submit project returns the appropriate response' do
    channel_id = '123456'
    @controller.stubs(:storage_decrypt_channel_id).returns([123, 456])
    submission_description = 'this project rocks'
    test_project = create :project
    # Stub project that passes all submit/pbulish restrictions.
    test_project.stubs(:submission_status).returns(SharedConstants::PROJECT_SUBMISSION_STATUS[:CAN_SUBMIT])
    Project.stubs(:find_by).returns(test_project)
    Projects.any_instance.stubs(:publish).returns({})
    post :submit, params: {project_type: 'music', channel_id: channel_id, submissionDescription: submission_description}
    assert_response :success

    # Stub project that is already submitted/published.
    test_project.stubs(:submission_status).returns(SharedConstants::PROJECT_SUBMISSION_STATUS[:ALREADY_SUBMITTED])
    post :submit, params: {project_type: 'music', channel_id: channel_id, submissionDescription: submission_description}
    assert_response :forbidden
  end
end
