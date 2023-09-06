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

    # if we do not recognize the course name, assume it is a 3rd party hour of
    # code tutorial.
    course_name = recognized_course_name?(data['course']) ? data['course'] : 'hourofcode'

    course_version = CurriculumHelper.find_matching_course_version(course_name)
    course_title = course_version&.localized_title
    begin
      image = CertificateImage.create_course_certificate_image(data['name'], course_name, data['donor'], course_title)
      image.format = format
      content_type = "image/#{format}"
      send_data image.to_blob, type: content_type
    ensure
      image&.destroy!
    end
  end

  private def recognized_course_name?(name)
    name.nil? ||
    name == ScriptConstants::ACCELERATED_NAME ||
    CertificateImage.prefilled_title_course?(name) ||
    CurriculumHelper.find_matching_course_version(name)
  end
end
