class Pd::WorkshopCertificateController < ApplicationController
  include ActiveSupport::NumberHelper

  before_action :authenticate_user!
  load_resource :enrollment, class: 'Pd::Enrollment', find_by: :code, id_param: :enrollment_code

  HARDCODED_CSD_FACILITATOR = 'Dani McAvoy'
  HARDCODED_CSP_FACILITATOR = 'Brook Osborne'

  def generate_certificate
    workshop = @enrollment.workshop

    facilitator_names =
      if workshop.teachercon?
        case workshop.course
        when Pd::Workshop::COURSE_CSD
          [HARDCODED_CSD_FACILITATOR]
        when Pd::Workshop::COURSE_CSP
          [HARDCODED_CSP_FACILITATOR]
        else
          ["Code.org team"]
        end
      else
        workshop.facilitators.map {|f| f.name.strip}.sort
      end

    begin
      image = create_workshop_certificate_helper(workshop, facilitator_names)

      send_data image.to_blob, type: 'image/png', disposition: 'inline'
    ensure
      image.try(:destroy!)
    end
  end

  def create_workshop_certificate_helper(workshop, facilitator_names)
    course_name =
      if workshop.csf?
        [
          {
            string: workshop.course_name,
            y: 780,
            pointsize: 90,
            height: 100,
          },
          {
            string: workshop.friendly_subject,
            y: 870,
            pointsize: 80,
            height: 90,
          }
        ]
      else
        [
          {
            string: workshop.course_name,
            y: 800,
            pointsize: 90,
            height: 100,
          }
        ]
      end

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

    create_workshop_certificate_image(
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
          string: number_to_rounded(workshop.effective_num_hours, precision: 1, strip_insignificant_zeros: true),
          y: 975,
          x: 1065,
          height: 40,
          width: 50,
          pointsize: 40,
        },
        {
          string: workshop.workshop_date_range_string,
          y: 1042,
          height: 50,
          pointsize: 45,
        }
      ] + course_name + facilitator_fields
    )
  end
end
