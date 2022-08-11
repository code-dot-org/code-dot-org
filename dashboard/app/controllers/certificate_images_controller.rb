require 'base64'

class CertificateImagesController < ApplicationController
  # GET /certificate_images/filename.jpg
  # filename includes three encoded params:
  #   name - student name (required)
  #   course - course name (optional)
  #   donor - donor name (required)
  def show
    filename = params[:filename]
    format = params[:format]
    unless ['jpg', 'jpeg', 'png'].include?(format)
      return render status: :bad_request, json: {message: "invalid format: #{format}"}
    end

    begin
      data = JSON.parse(Base64.urlsafe_decode64(filename))
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return render status: :bad_request, json: {message: 'invalid base64'}
    end

    if data['donor'] && !DashboardCdoDonor.valid_donor_name?(data['donor'])
      return render status: :bad_request, json: {message: 'invalid donor name'}
    end

    if data['course'] && !ScriptConstants.has_csf_congrats_page?(data['course']) && !CertificateImage.hoc_course?(data['course'])
      return render status: :bad_request, json: {message: 'invalid course name'}
    end

    begin
      image = CertificateImage.create_course_certificate_image(data['name'], data['course'], data['donor'])
      image.format = format
      content_type = "image/#{format}"
      send_data image.to_blob, type: content_type
    ensure
      image&.destroy!
    end
  end
end
