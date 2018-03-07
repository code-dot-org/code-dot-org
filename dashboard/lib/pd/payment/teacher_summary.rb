module Pd::Payment
  class TeacherSummary
    def initialize(
      workshop_summary:,
      teacher:,
      enrollment: nil,
      raw_days:,
      raw_hours:,
      days:,
      hours:
    )
      @workshop_summary = workshop_summary
      @teacher = teacher
      @enrollment = enrollment
      @raw_days = raw_days
      @raw_hours = raw_hours
      @days = days
      @hours = hours
    end

    attr_reader :workshop_summary

    attr_reader :teacher, :enrollment

    attr_reader :raw_days, :raw_hours

    attr_reader :days, :hours

    # @return [TeacherPayment] payment information for this teacher in this workshop
    attr_accessor :payment

    def qualified?
      !payment.nil?
    end

    def school_district
      enrollment.try(&:school_info).try(&:school_district)
    end

    def state
      enrollment.try(&:school_info).try(&:state)
    end

    def school
      enrollment.try(&:school_name)
    end

    delegate :workshop, to: :workshop_summary

    def generate_teacher_progress_report_line_item(with_payment = false)
      line_item = {
        teacher_first_name: enrollment.first_name,
        teacher_last_name: enrollment.last_name,
        teacher_id: teacher.try(&:id),
        teacher_email: enrollment.email,
        plp_name: workshop_summary.plp.try(&:name),
        state: state,
        district_name: school_district.try(&:name),
        district_id: school_district.try(&:id),
        school: school,
        course: workshop.course,
        subject: workshop.subject,
        workshop_id: workshop.id,
        workshop_dates: workshop.sessions.map(&:formatted_date).join(' '),
        workshop_name: workshop.friendly_name,
        on_map: workshop.on_map,
        funded: workshop.funding_summary,
        organizer_name: workshop.organizer.name,
        organizer_email: workshop.organizer.email,
        year: workshop.year,
        hours: hours,
        days: days
      }

      if with_payment
        line_item.merge!(
          {
            pay_period: workshop_summary.pay_period,
            payment_type: payment.try(&:type),
            payment_rate: payment.try(&:rate),
            qualified: qualified?,
            payment_amount: payment.try(&:amount)
          }
        )
      end

      line_item
    end
  end
end
