module CertificatesHelper
  def encode_params(name, course, donor)
    opts = {
      name: name,
      course: course,
      donor: donor
    }.compact
    Base64.urlsafe_encode64(opts.to_json)
  end

  def certificate_image_url(name, course, donor)
    return CDO.code_org_url('/images/hour_of_code_certificate.jpg') unless course.present?
    return CDO.code_org_url("/images/#{CertificateImage.certificate_template_for(course)}") unless name
    encoded = encode_params(name, course, donor)
    "/certificate_images/#{encoded}.jpg"
  end

  def certificate_print_url(name, course, donor)
    encoded = encode_params(name, course, donor)
    "/print_certificates/#{encoded}"
  end
end
