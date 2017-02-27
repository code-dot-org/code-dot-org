class Pd::CsfCertificateController < ApplicationController
  before_action :authenticate_user!

  def generate_certificate
    enrollment = params[:enrollment_code] ? Pd::Enrollment.find_by(code: params[:enrollment_code]) : nil

    image = create_certificate_image2(
      dashboard_dir('app', 'assets', 'images', 'pd_workshop_certificate_csf.png'),
      enrollment.try(:name) || '',
      y: 444,
      height: 100
    )

    send_data image.to_blob, type: 'image/png', disposition: 'inline'
  end
end
