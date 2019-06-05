require 'pd/certificate_renderer'

class Pd::WorkshopCertificateController < ApplicationController
  before_action :authenticate_user!
  # TODO: Should this be load_and_authorize_resource?
  load_resource :enrollment, class: 'Pd::Enrollment',
    find_by: :code, id_param: :enrollment_code

  def generate_certificate
    image = Pd::CertificateRenderer.render_workshop_certificate @enrollment
    send_data image.to_blob, type: 'image/png', disposition: 'inline'
  ensure
    image.try :destroy!
  end
end
