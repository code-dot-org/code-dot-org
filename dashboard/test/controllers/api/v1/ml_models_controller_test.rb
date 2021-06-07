require 'test_helper'

class Api::V1::MlModelsControllerTest < ::ActionController::TestCase
  setup do
    AWS::S3.stubs(:delete_from_bucket).returns(true)
    AWS::S3.stubs(:upload_to_bucket).returns(true)
    ShareFiltering.stubs(:find_failure).returns(nil)
    @owner = create :student
    @model = create :user_ml_model, user: @owner
    @not_owner = create :student
  end

  test 'user can successfully save an ML model' do
    sign_in @owner
    assert_difference('UserMlModel.count', 1) do
      post :save, params: {"ml_model" => {"name" => "Model Name"}}
    end
    assert_response :success
  end

  test 'returns a failure when saving a nonexistent model' do
    sign_in @owner
    post :save, params: nil
    assert_response :bad_request
  end

  test 'returns a failure when saving a model with invalid data' do
    sign_in @owner
    post :save, params: {"ml_model" => nil}
    assert_response :bad_request
  end

  test 'returns failure when model does not have a name' do
    sign_in @owner
    post :save, params: {"ml_model" => {"name" => nil}}
    assert_equal "failure", JSON.parse(@response.body)["status"]
  end

  test 'returns failure when model contains profanity' do
    sign_in @owner
    ShareFiltering.stubs(:find_failure).returns(ShareFailure.new('profanity', 'damn'))
    post :save, params: {"ml_model" => {"name" => "Naughty Model"}}
    assert_equal "piiProfanity", JSON.parse(@response.body)["status"]
  end

  test 'returns failure when model saves to database but not S3' do
    sign_in @owner
    AWS::S3.stubs(:upload_to_bucket).returns(false)
    assert_difference('UserMlModel.count', 1) do
      post :save, params: {"ml_model" => {"name" => "Model Name"}}
    end
    assert_equal "failure", JSON.parse(@response.body)["status"]
  end

  test 'user can retrieve the names, ids, and metadata of their trained ML models' do
    sign_in @owner
    create_list(:user_ml_model, 2, user: @owner)

    database_model_data = UserMlModel.where(user_id: @owner.id).
      map {|user_ml_model| {id: user_ml_model.model_id, name: user_ml_model.name, metadata: JSON.parse(user_ml_model.metadata)}}

    get :names

    api_model_data = @response.body

    assert_equal database_model_data.to_json, api_model_data
    assert_response :success
  end

  test 'user can not retrieve models they do not own' do
    sign_in @not_owner

    database_model_data = UserMlModel.where(user_id: @owner.id).
      map {|user_ml_model| {id: user_ml_model.model_id}}

    get :names

    api_model_data = JSON.parse(@response.body).
      map {|user_ml_model| {id: user_ml_model.model_id}}

    intersection = api_model_data & database_model_data

    assert_response :success
    assert_equal [], intersection
  end

  test 'retrieves a trained model from S3' do
    sign_in @owner
    AWS::S3.stubs(:download_from_bucket).returns(true)
    get :show, params: {id: @model.model_id}
    assert_response :success
  end

  test 'user can not retrieve nonexistant models' do
    sign_in @owner
    AWS::S3.stubs(:download_from_bucket).returns(false)
    get :show, params: {id: "fake_id"}
    assert_response :not_found
  end

  test 'user can not delete nonexistant models' do
    sign_in @owner
    delete :destroy, params: {id: "fake_id"}
    assert_response :not_found
  end

  test 'user can delete own model' do
    sign_in @owner
    delete :destroy, params: {id: @model.model_id}
    assert_response :success
  end

  test 'user can not delete models they do not own' do
    sign_in @not_owner
    delete :destroy, params: {id: @model.model_id}
    assert_response :forbidden
  end
end
