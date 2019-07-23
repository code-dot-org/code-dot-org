require 'test_helper'

class Pd::CsfCertificateControllerTest < ::ActionController::TestCase
  test 'Redirects to generic workshop certificate controller' do
    Honeybadger.stubs :notify
    enrollment = create :pd_enrollment
    get :generate_certificate, params: {enrollment_code: enrollment.code}
    assert_redirected_to "/pd/generate_workshop_certificate/#{enrollment.code}"
  end

  test 'Sends a Honeybadger DeprecatedEndpointWarning notification' do
    test_referer = 'http://example.com/example_referer'

    Honeybadger.expects(:notify).with do |params|
      assert_equal 'DeprecatedEndpointWarning', params[:error_class]
      assert_includes params[:error_message], '/pd/generate_csf_certificate/abcd'
      assert_equal test_referer, params[:context][:referer]
      true
    end

    @request.env['HTTP_REFERER'] = test_referer
    get :generate_certificate, params: {enrollment_code: 'abcd'}
  end
end
