require 'test_helper'
require 'json'

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

  test 'user can not delete non-existant models' do
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

  test 'user can successfully save an ML model' do
    sign_in @owner
    post :save, params: {"ml_model" => @params_ml_model}
    assert_response :success
  end

  test 'user sees a failure message when saving a nonexistent model' do
    sign_in @owner
    # nil => {}
    post :save, params: nil
    assert_response :bad_request
  end

  test 'user sees a failure message when saving a model with invalid data' do
    sign_in @owner
    # {"ml_model" => nil} => {"ml_model" => ""}
    post :save, params: {"ml_model" => nil}
    assert_response :bad_request
  end

  test 'returns failure when model cannot save' do
    sign_in @owner
    post :save, params: {"ml_model" => {"name" => nil}}
    assert_equal "failure", JSON.parse(@response.body)["status"]
  end
end
