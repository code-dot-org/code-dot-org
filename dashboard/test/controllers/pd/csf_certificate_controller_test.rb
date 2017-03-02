require 'test_helper'

class Pd::CsfCertificateControllerTest < ::ActionController::TestCase
  setup do
    @user = create :teacher
    sign_in(@user)
    @enrollment = create :pd_enrollment
  end

  test 'Generates certificate for a real user' do
    get :generate_certificate, params: {enrollment_code: @enrollment.code}
    assert_response :success
  end

  test 'Generates no certificate for an invalid enrollment' do
    assert_raise ActiveRecord::RecordNotFound do
      get :generate_certificate, params: {enrollment_code: "garbage code"}
    end
  end

  test 'Redirects if user is signed out' do
    sign_out(@user)

    get :generate_certificate, params: {enrollment_code: @enrollment.code}
    assert_response :redirect
  end
end
