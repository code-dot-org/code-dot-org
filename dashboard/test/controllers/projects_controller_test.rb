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

  self.use_transactional_test_case = false

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

    @project_owner = create :student
    @test_project = create :project, owner: @project_owner
    @channel_id = @test_project.channel_id
  end

  teardown do
    AzureTextToSpeech.unstub(:get_voices)
  end

  test 'submission status returns appropriate status' do
    sign_in_with_request @project_owner
    Project.stubs(:find_by).returns(@test_project)
    channel_id = '123456'
    @controller.stubs(:storage_decrypt_channel_id).returns([123, 456])
    SharedConstants::PROJECT_SUBMISSION_STATUS.each_value do |status|
      @test_project.stubs(:submission_status).returns(status)
      get :submission_status, params: {project_type: 'music', channel_id: channel_id}
      assert_response :success
      response_status = JSON.parse(@response.body)["status"]
      assert_equal response_status, status
    end
  end

  test 'submit project returns bad_request if no submission description' do
    submission_description = ''
    post :submit, params: {project_type: 'music', channel_id: @channel_id, submissionDescription: submission_description}
    assert_response :bad_request
  end

  test 'submit project returns forbidden if project already submitted' do
    submission_description = 'this project rocks'
    sign_in_with_request @project_owner
    @test_project.stubs(:submission_status).returns(SharedConstants::PROJECT_SUBMISSION_STATUS[:ALREADY_SUBMITTED])
    Project.stubs(:find_by).returns(@test_project)
    Projects.any_instance.stubs(:publish).returns({published_at: Time.now})
    post :submit, params: {project_type: 'music', channel_id: @channel_id, submissionDescription: submission_description}
    assert_response :forbidden
  end

  test 'submit project returns success if project passes all restrictions' do
    submission_description = 'this project rocks'
    sign_in_with_request @project_owner
    Project.stubs(:find_by).returns(@test_project)
    @controller.stubs(:send_project_submission).returns(:success)
    Projects.any_instance.stubs(:publish).returns({published_at: Time.now})
    @test_project.stubs(:submission_status).returns(SharedConstants::PROJECT_SUBMISSION_STATUS[:CAN_SUBMIT])
    sign_in_with_request @project_owner
    post :submit, params: {project_type: 'music', channel_id: @channel_id, submissionDescription: submission_description}
    assert_response :success
  end
end
