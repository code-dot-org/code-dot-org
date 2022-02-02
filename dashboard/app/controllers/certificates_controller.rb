require 'base64'

class CertificatesController < ApplicationController
  include CertificatesHelper

  # GET /certificates/:encoded_params
  def show
    prevent_caching

    begin
      data = JSON.parse(Base64.urlsafe_decode64(params[:encoded_params]))
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return render status: :bad_request, json: {message: 'invalid base64'}
    end

    @certificate_image_url = certificate_image_url(data['name'], data['course'])
  end
end
