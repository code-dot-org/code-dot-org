require 'base64'

class CertificateImagesController < ApplicationController
  # GET /certificate_images/filename.jpg
  def show
    filename = params[:filename]
    format = params[:format]
    return head :bad_request unless ['jpg', 'jpeg', 'png'].include?(format)

    begin
      data = JSON.parse(Base64.urlsafe_decode64(filename))
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return head :bad_request
    end

    begin
      image = create_course_certificate_image(data['name'], data['course'], data['sponsor'], data['course_title'])
      image.format = format
      content_type = "image/#{format}"
      send_data image.to_blob, type: content_type
    ensure
      image && image.destroy!
    end
  end
end
