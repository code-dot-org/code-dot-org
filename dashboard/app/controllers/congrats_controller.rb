class CongratsController < ApplicationController
  include CertificatesHelper

  def index
    view_options(full_width: true, responsive_content: true, has_i18n: true)

    # Select two different donors, because the first must have a twitter
    # handle and the second must be equally weighted across all donors.
    @random_donor_twitter = CdoDonor.get_random_donor_twitter
    @random_donor_name = CdoDonor.get_random_donor_name
    course_name = params[:s] && Base64.urlsafe_decode64(params[:s])
    @certificate_image_url = certificate_image_url(nil, course_name, nil)
  end
end
