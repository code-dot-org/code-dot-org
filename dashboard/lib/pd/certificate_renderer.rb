module Pd
  class CertificateRenderer
    HARDCODED_CSD_FACILITATOR = 'Dani McAvoy'
    HARDCODED_CSP_FACILITATOR = 'Brook Osborne'
    HARDCODED_OTHER_TEACHERCON_FACILITATOR = 'Code.org team'

    # Given a PD enrollment, renders a workshop completion certificate.
    #
    # @note This method returns a newly-allocated Magick::Image object.
    #       The caller MUST ensure image#destroy! is called on the returned image
    #       object to avoid memory leaks.
    #
    # @param [Pd::Enrollment] a teacher's workshop enrollment
    def self.render_workshop_certificate(enrollment)
      create_workshop_certificate_image(
        dashboard_dir('app', 'assets', 'images', 'pd_workshop_certificate_generic.png'),
        [
          *teacher_name(enrollment),
          *pd_hours(enrollment.workshop),
          *workshop_dates(enrollment.workshop),
          *course_name(enrollment.workshop),
          *facilitators(enrollment.workshop)
        ]
      )
    end

    # The methods that follow generate field configurations for printing text
    # onto the certificate image.

    private_class_method def self.teacher_name(enrollment)
      [
        {
          string: enrollment.try(:full_name) || '',
          pointsize: 70,
          x: 0,
          y: -240,
          width: 1200,
          height: 100,
        }
      ]
    end

    private_class_method def self.course_name(workshop)
      [
        {
          string: workshop.course_name,
          y: -30,
          pointsize: 70,
          width: 1600,
          height: 100,
        },
        {
          string: workshop.friendly_subject,
          y: 65,
          pointsize: 60,
          width: 1600,
          height: 100,
        }
      ]
    end

    private_class_method def self.pd_hours(workshop)
      [
        {
          string: ActiveSupport::NumberHelper.number_to_rounded(workshop.effective_num_hours, precision: 1, strip_insignificant_zeros: true),
          y: 143,
          x: -265,
          pointsize: 30,
          width: 60,
          height: 50,
        }
      ]
    end

    private_class_method def self.workshop_dates(workshop)
      [
        {
          string: workshop.workshop_date_range_string,
          y: 228,
          pointsize: 33,
          width: 1000,
          height: 50,
        }
      ]
    end

    private_class_method def self.facilitators(workshop)
      facilitator_names(workshop).each_with_index.map do |name, i|
        {
          string: name,
          pointsize: 30,
          y: 475 - (50 * i),
          x: 330,
          width: 500,
          height: 50,
        }
      end
    end

    private_class_method def self.facilitator_names(workshop)
      if workshop.teachercon?
        case workshop.course
        when Pd::Workshop::COURSE_CSD
          [HARDCODED_CSD_FACILITATOR]
        when Pd::Workshop::COURSE_CSP
          [HARDCODED_CSP_FACILITATOR]
        else
          [HARDCODED_OTHER_TEACHERCON_FACILITATOR]
        end
      else
        workshop.facilitators.map {|f| f.name.strip}.sort
      end
    end
  end
end
