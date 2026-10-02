module Pd
  class CertificateRenderer
    HARDCODED_CSD_FACILITATOR = 'Dani McAvoy'
    HARDCODED_CSP_FACILITATOR = 'Brook Osborne'
    HARDCODED_OTHER_TEACHERCON_FACILITATOR = 'Code.org team'

    # Facilitator names stack upward from just above the template's
    # "FACILITATOR" label, and must stay below the date line.
    FACILITATOR_BOTTOM_Y = 332
    FACILITATOR_STACK_HEIGHT = 120
    FACILITATOR_MAX_LINE_HEIGHT = 50
    FACILITATOR_MAX_POINTSIZE = 30

    # Given a PD enrollment, renders a workshop completion certificate.
    #
    # @note This method returns a newly-allocated Magick::Image object.
    #       The caller MUST ensure image#destroy! is called on the returned image
    #       object to avoid memory leaks.
    #
    # @param [Pd::Enrollment] a teacher's workshop enrollment
    def self.render_workshop_certificate(enrollment)
      workshop = enrollment.workshop

      # For Build Your Own workshops, display the workshop's name (and append 'Workshop' if not already present).
      # For other workshops, display the workshop's course name instead.
      has_name = workshop.name.present?
      workshop_title = has_name ? workshop.name : workshop.course_name
      if has_name && !workshop_title.downcase.end_with?('workshop')
        workshop_title += ' Workshop'
      end

      CertificateImage.create_workshop_certificate_image(
        dashboard_dir('app', 'assets', 'images', 'pd_workshop_certificate_generic.png'),
        [
          *teacher_name(enrollment),
          *pd_hours(workshop),
          *workshop_dates(workshop),
          *course_info(workshop_title, workshop.friendly_subject),
          *facilitators(workshop)
        ]
      )
    end

    # The methods that follow generate field configurations for printing text
    # onto the certificate image.

    private_class_method def self.teacher_name(enrollment)
      [
        {
          string: enrollment.try(:full_name) || '',
          pointsize: 60,
          x: 0,
          y: -200,
          width: 1200,
          height: 100,
        }
      ]
    end

    private_class_method def self.course_info(workshop_title, subject)
      course_info_text = [
        {
          string: workshop_title,
          y: -30,
          pointsize: 56,
          width: 1600,
          height: 100,
        }
      ]

      if subject
        course_info_text.push(
          {
            string: subject,
            y: 55,
            pointsize: 48,
            width: 1600,
            height: 100,
          }
        )
      end

      course_info_text
    end

    private_class_method def self.pd_hours(workshop)
      [
        {
          string: ActiveSupport::NumberHelper.number_to_rounded(workshop.num_scheduled_session_hours, precision: 1, strip_insignificant_zeros: true),
          y: 130,
          x: -233,
          pointsize: 34,
          width: 90,
          height: 50,
        }
      ]
    end

    private_class_method def self.workshop_dates(workshop)
      [
        {
          string: workshop.workshop_date_range_string,
          y: 175,
          pointsize: 30,
          width: 1000,
          height: 50,
        }
      ]
    end

    private_class_method def self.facilitators(workshop)
      names = facilitator_names(workshop)
      line_height = [FACILITATOR_MAX_LINE_HEIGHT, FACILITATOR_STACK_HEIGHT / [names.size - 1, 1].max].min
      # Rendered glyphs, descenders included, stand about 1.25x the pointsize.
      pointsize = [FACILITATOR_MAX_POINTSIZE, (line_height * 0.65).floor].min
      names.each_with_index.map do |name, i|
        {
          string: name,
          pointsize: pointsize,
          y: FACILITATOR_BOTTOM_Y - (line_height * i),
          x: 211,
          width: 440,
          height: line_height,
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
