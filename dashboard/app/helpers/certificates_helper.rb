module CertificatesHelper
  def encode_params(name, course, sponsor)
    opts = {
      name: name,
      course: course,
      sponsor: sponsor
    }.compact
    Base64.urlsafe_encode64(opts.to_json)
  end

  def certificate_image_url(name, course, sponsor)
    return CDO.code_org_url('/images/hour_of_code_certificate.jpg') unless course.present?
    return CDO.code_org_url("/images/#{CertificateImage.certificate_template_for(course)}") unless name
    encoded = encode_params(name, course, sponsor)
    "/certificate_images/#{encoded}.jpg"
  end

  def certificate_print_url(name, course, sponsor)
    encoded = encode_params(name, course, sponsor)
    "/print_certificates/#{encoded}"
  end
end
