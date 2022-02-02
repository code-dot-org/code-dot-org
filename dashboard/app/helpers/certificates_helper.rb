module CertificatesHelper
  def certificate_image_url(name, course)
    return '/images/hour_of_code_certificate.jpg' unless course

    opts = {
      name: name,
      course: course
    }.compact
    encoded = Base64.urlsafe_encode64(opts.to_json)
    "/certificate_images/#{encoded}.jpg"
  end
end
