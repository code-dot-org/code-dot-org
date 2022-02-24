require 'base64'

class CertificatesController < ApplicationController
  include CertificatesHelper

  # GET /certificates/:encoded_params
  # encoded_params includes:
  #   name - student name (optional)
  #   course - course name (optional)
  #   donor - donor name (optional)
  def show
    view_options(full_width: true, responsive_content: true)

    begin
      data = JSON.parse(Base64.urlsafe_decode64(params[:encoded_params]))
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return render status: :bad_request, json: {message: 'invalid base64'}
    end

    announcement = Announcements.get_announcement_for_page('/certificates')

    @certificate_data = {
      imageUrl: certificate_image_url(data['name'], data['course'], data['donor']),
      printUrl: certificate_print_url(data['name'], data['course'], data['donor']),
      announcement: announcement
    }
  end
end
