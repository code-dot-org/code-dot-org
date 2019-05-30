#
# This controller is deprecated as of May 2019.  All certificates should be served through
# WorkshopCertificateController now.
# We're not immediately removing this because teachers may have bookmarked their certificate link
# and would expect to get the same certificate, here. (Could update routing though).
# Brad
#
class Pd::CsfCertificateController < ApplicationController
  before_action :authenticate_user!
  load_resource :enrollment, class: 'Pd::Enrollment', find_by: :code, id_param: :enrollment_code

  def generate_certificate
    image = create_certificate_image2(
      dashboard_dir('app', 'assets', 'images', 'pd_workshop_certificate_csf.png'),
      @enrollment.try(:full_name) || '',
      y: 444,
      height: 100
    )

    send_data image.to_blob, type: 'image/png', disposition: 'inline'
  ensure
    image.try(:destroy!)
  end
end
