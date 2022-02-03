module CertificatesHelper
  def encode_params(name, course)
    opts = {
      name: name,
      course: course
    }.compact
    Base64.urlsafe_encode64(opts.to_json)
  end

  def certificate_image_url(name, course)
    return '/images/hour_of_code_certificate.jpg' unless course
    encoded = encode_params(name, course)
    "/certificate_images/#{encoded}.jpg"
  end
end
