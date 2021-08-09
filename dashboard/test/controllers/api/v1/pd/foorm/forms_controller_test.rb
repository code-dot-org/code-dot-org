require 'test_helper'

module Api::V1::Pd::Foorm
  class FormsControllerTest < ::ActionController::TestCase
    test_user_gets_response_for :validate_form, user: :student, method: :post, response: :forbidden

    test 'levelbuilder can validate form' do
      sign_in create :levelbuilder
      foorm = create :foorm_form
      post :validate_form, params: {form_questions: JSON.parse(foorm.questions)}
      assert_response :success
    end
  end
end
