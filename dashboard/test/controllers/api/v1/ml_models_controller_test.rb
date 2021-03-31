require 'test_helper'

class Api::V1::MlModelsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner = create :student
    @model = create :user_ml_model,  user: @owner
    @not_owner = create :student
  end

  test 'user can delete own model' do
    sign_in @owner
    delete "/api/v1/ml_models/#{@model.model_id}"
    assert_response :success
  end

  test 'user can not delete models they do not own' do
    sign_in @not_owner
    delete "/api/v1/ml_models/#{@model.model_id}"
    assert_response :forbidden
  end
end
