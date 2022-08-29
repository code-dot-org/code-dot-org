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

  def blank
    announcement = Announcements.get_announcement_for_page('/certificates')

    @certificate_data = {
      imageUrl: certificate_image_url(nil, 'hourofcode', nil),
      printUrl: certificate_print_url(nil, 'hourofcode', nil),
      announcement: announcement
    }

    render :show
  end

  # GET /certificates/batch
  def batch
    begin
      course_name = params[:s] && Base64.urlsafe_decode64(params[:s])
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return render status: :bad_request, json: {message: 'invalid base64'}
    end

    @certificate_data = {
      courseName: course_name,
      imageUrl: certificate_image_url(nil, course_name, nil),
    }
  end
end
