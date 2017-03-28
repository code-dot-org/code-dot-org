class Pd::WorkshopCertificateController < ApplicationController
  before_action :authenticate_user!
  load_resource :enrollment, class: 'Pd::Enrollment', find_by: :code, id_param: :enrollment_code

  def generate_certificate
    workshop = @enrollment.workshop

    facilitator_names = workshop.facilitators.map {|f| f.name.strip}.sort
    facilitator_fields = facilitator_names.each_with_index.map do |name, i|
      {
        string: name,
        height: 50,
        pointsize: 40,
        width: 420,
        y: 1305 - (50 * i),
        x: 1290,
      }
    end

    begin
      image = create_workshop_certificate_image(
        dashboard_dir('app', 'assets', 'images', 'pd_workshop_certificate_generic.png'),
        [
          {
            string: @enrollment.try(:full_name) || '',
            pointsize: 90,
            height: 100,
            width: 1200,
            x: 570,
            y: 570,
          },
          {
            string: workshop.course_name,
            y: 800,
            pointsize: 90,
            height: 100,
          },
          {
            string: workshop.effective_num_hours.to_i.to_s,
            y: 975,
            x: 1065,
            height: 40,
            width: 50,
            pointsize: 40,
          },
          {
            string: workshop.workshop_starting_date.strftime('%B %e, %Y'),
            y: 1042,
            height: 50,
            pointsize: 45,
          }
        ] + facilitator_fields
      )

      send_data image.to_blob, type: 'image/png', disposition: 'inline'
    ensure
      image.try(:destroy!)
    end
  end
end
