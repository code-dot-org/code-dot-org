require 'base64'

class PrintCertificatesController < ApplicationController
  include CertificatesHelper

  # GET /print_certificates/:encoded_params
  def show
    prevent_caching
    view_options(no_header: true, no_footer: true, white_background: true, full_width: true)

    begin
      data = JSON.parse(Base64.urlsafe_decode64(params[:encoded_params]))
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return render status: :bad_request, json: {message: 'invalid base64'}
    end

    @student_name = data['name']
    @certificate_image_url = certificate_image_url(data['name'], data['course'], data['sponsor'])
  end
end
