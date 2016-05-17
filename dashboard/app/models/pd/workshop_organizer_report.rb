class Pd::WorkshopOrganizerReport

  # Construct a report row for each workshop for each organizer
  def self.generate_organizer_report(organizer)
    closed_workshops = Pd::Workshop.in_state(Pd::Workshop::STATE_ENDED)

    if organizer.admin?
      return closed_workshops.all.map do |workshop|
        generate_organizer_report_row(workshop)
      end
    end

    closed_workshops.organized_by(organizer).all.map do |workshop|
      generate_organizer_report_row(workshop)
    end
  end

  def self.generate_organizer_report_row(workshop)
    payment = Pd::WorkshopOrganizerPayment.new(workshop)
    section_url = workshop.section ?
      CDO.code_org_url("/teacher-dashboard#/sections/#{workshop.section.id}", 'http:') : nil
    payment_type =
      if payment.plp
        payment.plp.urban? ? 'PLP Urban' : 'PLP Non-urban'
      elsif workshop.course == Pd::Workshop::COURSE_CSF
        'CSF Facilitator'
      else
        nil
      end

    {
      organizer_name: workshop.organizer.name,
      organizer_id: workshop.organizer.id,
      organizer_email: workshop.organizer.email,
      workshop_dates: workshop.sessions.map(&:formatted_date).join(' '),
      workshop_type: workshop.workshop_type,
      section_url: section_url,
      facilitators: workshop.facilitators.map(&:name).join(', '),
      num_facilitators: workshop.facilitators.count,
      workshop_name: workshop.friendly_name,
      course: workshop.course,
      subject: workshop.subject,
      num_teachers: payment.teachers.count,
      days: workshop.sessions.count,
      payment_type: payment_type,
      qualified: payment.qualified,
      teacher_payment: payment.parts[:teacher],
      facilitator_payment: payment.parts[:facilitator],
      staffer_payment: payment.parts[:staffer],
      venue_payment: payment.parts[:venue],
      payment_total: payment.total
    }
  end
end
