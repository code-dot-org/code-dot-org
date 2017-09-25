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
