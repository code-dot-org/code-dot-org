require 'test_helper'

class CodeReviewsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @project_owner = create :student
    @storage_id = create_storage_id_for_user(@project_owner.id)
    @channel_id = create :project, storage_id: @storage_id
    _,  @project_id = storage_decrypt_channel_id(@channel_id)
  end

  setup do
    sign_in @project_owner
  end

  test 'index returns both open and closed code reviews' do
    script_id = 12
    level_id = 5

    closed_at = DateTime.now
    create :code_review, user_id: @project_owner.id, project_id: @project_id,
      script_id: script_id, level_id: level_id, closed_at: closed_at
    create :code_review, user_id: @project_owner.id, project_id: @project_id,
      script_id: script_id, level_id: level_id, closed_at: closed_at + 1.second
    create :code_review, user_id: @project_owner.id, project_id: @project_id,
      script_id: script_id, level_id: level_id, closed_at: nil

    get :index, params: {
      channelId: @channel_id,
      scriptId: script_id,
      levelId: level_id
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    assert_equal 3, response_json.length
  end

  test 'create code review' do
    script_id = 42
    level_id = 17
    project_version = 'abc'

    post :create, params: {
      scriptId: script_id,
      levelId: level_id,
      channelId: @channel_id,
      version: project_version
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    assert_not_nil response_json['id']
    assert_equal script_id, response_json['scriptId']
    assert_equal level_id, response_json['levelId']
    assert_equal project_version, response_json['version']
    assert_equal false, response_json['isVersionExpired']
    assert_equal true, response_json['isOpen']
    assert_not_nil response_json['createdAt']
  end

  test 'cannot create multiple open code reviews for the same script and level' do
    script_id = 23
    level_id = 11
    project_version = 'abc'

    post :create, params: {
      scriptId: script_id,
      levelId: level_id,
      channelId: @channel_id,
      version: project_version
    }
    assert_response :success

    assert_raises ActiveRecord::RecordInvalid do
      post :create, params: {
        scriptId: script_id,
        levelId: level_id,
        channelId: @channel_id,
        version: project_version
      }
    end
  end

  test 'close review' do
    code_review = create :code_review, user_id: @project_owner.id
    assert code_review.open?

    patch :update, params: {
      id: code_review.id,
      isClosed: true
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    refute response_json[:isOpen]

    code_review.reload
    refute code_review.open?
  end

  test 'update fails when trying to re-open a closed review' do
    code_review = create :code_review, user_id: @project_owner.id, closed_at: DateTime.now
    assert !code_review.open?

    patch :update, params: {
      id: code_review.id,
      isClosed: false
    }
    assert_response :bad_request
  end
end
