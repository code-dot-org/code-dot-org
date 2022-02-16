require 'base64'

class CertificateImagesController < ApplicationController
  # GET /certificate_images/filename.jpg
  # filename includes three encoded params:
  #   name - student name (required)
  #   course - the name of the script (optional)
  #   sponsor - donor name (required)
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

    return render status: :bad_request, json: {message: 'student name is required'} unless data['name']

    # ensure we do not select a random donor below, since doing so would make this page uncacheable.
    return render status: :bad_request, json: {message: 'donor name is required'} unless data['sponsor']
    return render status: :bad_request, json: {message: 'invalid donor name'} unless CdoDonor.valid_donor_name?(data['sponsor'])

    begin
      image = CertificateImage.create_course_certificate_image(data['name'], data['course'], data['sponsor'])
      image.format = format
      content_type = "image/#{format}"
      send_data image.to_blob, type: content_type
    ensure
      image && image.destroy!
    end
  end
end
