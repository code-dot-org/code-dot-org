require 'base64'

class CertificateImagesController < ApplicationController
  # GET /certificate_images/filename.jpg
  def show
    prevent_caching

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

    begin
      image = CertificateImage.create_course_certificate_image(data['name'], data['course'])
      image.format = format
      content_type = "image/#{format}"
      send_data image.to_blob, type: content_type
    ensure
      image && image.destroy!
    end
  end
end
