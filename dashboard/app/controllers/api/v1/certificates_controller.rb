require 'base64'

class Api::V1::CertificatesController < ApplicationController
  # GET /api/v1/certificates/user_info
  def user_info
    response.headers['Cache-Control'] = 'private, no-store'

    render json: {
      userName: current_user&.name,
      under13: current_user&.under_13? || false,
      userType: current_user&.user_type,
      csrfToken: form_authenticity_token,
    }
  end

  # GET /api/v1/certificates/congrats
  def congrats
    response.headers['Cache-Control'] = 'private, no-store'

    begin
      course_name = params[:s] && Base64.urlsafe_decode64(params[:s])
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return render status: :bad_request, json: {message: 'invalid base64'}
    end

    data = Api::V1::CongratsSerializer.new(current_user, course_name).as_json
    render json: data.merge(csrfToken: form_authenticity_token)
  end
end
