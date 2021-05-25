require 'test_helper'

class Api::V1::MlModelsControllerTest < ::ActionController::TestCase
  setup do
    AWS::S3.stubs(:delete_from_bucket).returns(true)
    AWS::S3.stubs(:upload_to_bucket).returns(true)
    @owner = create :student
    @model = create :user_ml_model, user: @owner
    @not_owner = create :student
    @params_ml_model = {
      "name" => "venom breath",
      "datasetDetails" => {
        "description" => "description.",
        "numRows" => 101
      },
      "selectedTrainer" => "knnClassify",
      "featureNumberKey" => {
        "Breathes" => {
          "Yes" => 0,
          "No" => 1
        },
      "Venomous" => {
        "No" => 0,
        "Yes" => 1
      }
      },
      "label" => {
        "id" => "Venomous",
        "description" => "Is the animal venomous?",
        "values" => %w[No Yes]
      },
      "features" => [{"id" => "Breathes",
                      "description" => "Does the animal breathe?",
                      "values" => %w[Yes No]}],
      "summaryStat" => {"type" => "classification",
                        "stat" => "90.00"},
      "trainedModel" => {"name" => "KNN"}
    }
  end

  # Tests for the Save controller action.
  test 'user can successfully save an ML model' do
    sign_in @owner
    assert_difference('UserMlModel.count', 1) do
      post :save, params: {"ml_model" => @params_ml_model}
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

  test 'returns failure when model cannot save' do
    sign_in @owner
    post :save, params: {"ml_model" => {"name" => nil}}
    assert_equal "failure", JSON.parse(@response.body)["status"]
  end

  test 'returns failure when model saves to database but not S3' do
    sign_in @owner
    AWS::S3.stubs(:upload_to_bucket).returns(false)
    assert_difference('UserMlModel.count', 1) do
      post :save, params: {"ml_model" => @params_ml_model}
    end
    assert_equal "failure", JSON.parse(@response.body)["status"]
  end

  # Tests for the Names controller action.
  test 'user can retrieve the names of trained ML models' do
    database_model_names = []
    api_model_names = []
    sign_in @owner
    create_list(:user_ml_model, 2)

    expected_ml_model_names = UserMlModel.where(user_id: @owner&.id).
      map {|user_ml_model| {name: user_ml_model.name}}

    JSON.parse(expected_ml_model_names.to_json).each do |model|
      database_model_names << model["name"]
    end

    get :names

    JSON.parse(@response.body).each do |model|
      api_model_names << model["name"]
    end

    assert_equal database_model_names, api_model_names
    assert_response :success
  end

  test 'user can retrieve the ids of trained ML models' do
    database_model_ids = []
    api_model_ids = []
    sign_in @owner
    create_list(:user_ml_model, 3)

    expected_ml_model_ids = UserMlModel.where(user_id: @owner&.id).
        map {|user_ml_model| {id: user_ml_model.model_id}}

    JSON.parse(expected_ml_model_ids.to_json).each do |model|
      database_model_ids << model["model_id"]
    end

    get :names

    JSON.parse(@response.body).each do |model|
      api_model_ids << model["model_id"]
    end

    assert_equal database_model_ids, api_model_ids
    assert_response :success
  end

  test 'user can retrieve the metadata of trained ML models' do
    database_model_metadata = []
    api_model_metadata = []
    sign_in @owner
    create_list(:user_ml_model, 2)

    expected_ml_model_metadata = UserMlModel.where(user_id: @owner&.id).
        map {|user_ml_model| {metadata: JSON.parse(user_ml_model.metadata)}}

    JSON.parse(expected_ml_model_metadata.to_json).each do |model|
      database_model_metadata << model["metadata"]
    end

    get :names

    JSON.parse(@response.body).each do |model|
      api_model_metadata << model["metadata"]
    end

    assert_equal database_model_metadata, api_model_metadata
    assert_response :success
  end

  # Tests for the Show controller action.
  test 'retrieves a trained model from S3' do
    sign_in @owner
    AWS::S3.stubs(:download_from_bucket).returns(true)
    get :show, params: {id: @model.model_id}
    assert_response :success
  end

  test 'renders 404 if model does not exist' do
    sign_in @owner
    AWS::S3.stubs(:download_from_bucket).returns(false)
    get :show, params: {id: "fake_id"}
    assert_response :not_found
  end

  # Tests for the Destroy controller action.
  test 'user can not delete nonexistant models' do
    sign_in @owner
    delete :destroy, params: {id: "fakeId"}
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
