require 'test_helper'

class Api::V1::MlModelsControllerTest < ::ActionController::TestCase
  setup do
    AWS::S3.stubs(:delete_from_bucket).returns(true)
    @owner = create :student
    @model = create :user_ml_model,  user: @owner
    @not_owner = create :student
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
end
