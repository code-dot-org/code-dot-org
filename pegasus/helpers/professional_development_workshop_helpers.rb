def generate_professional_development_workshop_payment_report(from=nil, to=nil)
  # generate a report to be used for paying affiliates

  DB[:forms].where(kind: "ProfessionalDevelopmentWorkshop").map do |row|
    data = JSON.parse(row[:data]) rescue {}
    processed_data = JSON.parse(row[:processed_data]) rescue {}

    stopped_at = Chronic.parse(data['stopped_dt'])

    # TODO: database can't do the below date filtering because stopped_at is in the serialized JSON
    next unless stopped_at
    next if from && to && (stopped_at < from || stopped_at > to)

    {
     email: row[:email],
     name: row[:name],
     section_url: "http://code.org/teacher-dashboard#/sections/#{data['section_id_s']}",
     stopped_at: stopped_at.to_s,
     total_attendee_count: processed_data['total_attendee_count_i'],
     qualifying_attendee_count: processed_data['qualifying_attendee_count_i']
    }
  end.compact
end
