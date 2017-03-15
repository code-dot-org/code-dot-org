require 'test_helper'

class Pd::CsfCertificateControllerTest < ::ActionController::TestCase
  setup do
    @user = create :teacher
    sign_in(@user)
    @enrollment = create :pd_enrollment
  end

  test_user_gets_response_for(
    :generate_certificate,
    name: 'Generates certificate for a real user',
    user: -> {@user},
    params: -> {{enrollment_code: @enrollment.code}}
  )

  test 'Generates no certificate for an invalid enrollment' do
    assert_raise ActiveRecord::RecordNotFound do
      get :generate_certificate, params: {enrollment_code: "garbage code"}
    end
  end

  test_redirect_to_sign_in_for :generate_certificate, params: -> {{enrollment_code: @enrollment.code}}
end
