class Pd::CsfCertificateController < ApplicationController
  before_action :authenticate_user!

  def generate_certificate
    image = create_certificate_image2(
      dashboard_dir('app', 'assets', 'images', 'pd_workshop_certificate_csf.png'),
      current_user.name || '',
      y: 444,
      height: 100
    )

    send_data image.to_blob, type: 'image/png', disposition: 'inline'
  end
end