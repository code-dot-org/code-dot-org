module CertificatesHelper
  def course_completion_certificate_url(session_id: nil, course_name: nil)
    congrats_url_params = {}

    congrats_url_params[:i] = session_id if session_id.present?
    congrats_url_params[:s] = Base64.urlsafe_encode64(course_name) if course_name.present?

    CDO.studio_url(Rails.application.routes.url_helpers.congrats_path(congrats_url_params), CDO.default_scheme)
  end

  def encode_params(name, course, donor)
    opts = {
      name: name,
      course: course,
      donor: donor
    }.compact
    Base64.urlsafe_encode64(opts.to_json)
  end

  def certificate_image_url_for(name)
    CDO.studio_url("blockly/media/certificates/#{name}", CDO.default_scheme)
  end

  def certificate_image_url(name, course, donor)
    return certificate_image_url_for('hour_of_code_certificate.jpg') if course.blank?
    is_prefilled = CertificateImage.prefilled_title_course?(course)
    return certificate_image_url_for(CertificateImage.certificate_template_for(course)) if is_prefilled && !name
    encoded = encode_params(name, course, donor)
    "/certificate_images/#{encoded}.jpg"
  end

  def twitter_certificate_image_url(name, course, donor)
    return certificate_image_url_for('hour_of_code_certificate.jpg') if course.blank?
    is_prefilled = CertificateImage.prefilled_title_course?(course)
    return certificate_image_url_for(CertificateImage.certificate_template_for(course)) if is_prefilled && !name
    encoded = encode_params(name, course, donor)
    CDO.studio_url("/certificate_images/#{encoded}.jpg", 'https:')
  end

  def certificate_print_url(name, course, donor)
    encoded = encode_params(name, course, donor)
    "/print_certificates/#{encoded}"
  end
end
