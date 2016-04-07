module Pd
  class DistrictReport

    # Construct a report row for each teacher in the district
    def self.generate_district_report(*districts)
      [].tap do |rows|
        districts.each do |district|
          district.users.all.each do |teacher|
            ::Pd::Workshop.attended_by(teacher).each do |workshop|
              rows << generate_district_report_row(district, teacher, workshop)
            end
          end
        end
      end
    end

    def self.generate_district_report_row(district, teacher, workshop)
      payment_term = DistrictPaymentTerm.where(district_id: district.id, course: workshop.course).first
      attendances = Attendance.for_teacher_in_workshop(teacher, workshop)
      hours = attendances.map(&:hours).reduce(&:+)
      days = attendances.count
      qualified = (payment_term && workshop.workshop_type == Workshop::TYPE_DISTRICT && workshop.course != Workshop::COURSE_CSF)
      payment_type = payment_term ? payment_term.rate_type : nil
      payment_rate = payment_term ? payment_term.rate : nil
      payment_amount = !qualified ? 0 :
        case payment_term.rate_type
          when 'hourly'
            hours * payment_term.rate
          when 'daily'
            days * payment_term.rate
          else
            0
        end

      {
        district_name: district.name,
        workshop_organizer_name: workshop.organizer.name,
        workshop_organizer_id: workshop.organizer.id,
        facilitators: workshop.facilitators.map(&:name).join(','),
        workshop_dates: workshop.sessions.map(&:formatted_date).join(','),
        workshop_type: workshop.workshop_type,
        course: workshop.course,
        subject: workshop.subject,
        school: teacher.school,
        teacher_name: teacher.name,
        teacher_id: teacher.id,
        teacher_email: teacher.email,
        year: workshop.year,
        hours: hours,
        days: days,
        payment_type: payment_type,
        payment_rate: payment_rate,
        qualified: qualified,
        payment_amount: payment_amount
      }
    end

  end
end
