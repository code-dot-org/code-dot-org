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

def generate_professional_development_workshop_teachers_report
  # generate a report about the teachers trained by affiliates and their students' progress
  PEGASUS_DB[:forms].where(kind: 'ProfessionalDevelopmentWorkshop').map do |affiliate|
    data = JSON.parse(affiliate[:data]) rescue {}

    section_id = data['section_id_s']
    next unless section_id

    # a row for each teacher trained by an affiliate
    DASHBOARD_DB[:followers].
      where(section_id: section_id).
      join(:users, id: :student_user_id).
      select(:users__id___id, :users__name___name, :users__email___email).map do |teacher|

      # get data on students of the teacher
      teacher_user_id = teacher[:id]
      next unless teacher_user_id
      
      students = DASHBOARD_DB[:followers].
        where(section_id: section_id).
        join(:users, id: :student_user_id).
        select(:users__id___id, :users__created_at___created_at)

      lifetime = students.map{|s| (Time.now - s[:created_at]) / (60 * 60 * 24)}.reduce(:+) / students.count.to_f

      levels = students.map do |s|
        DASHBOARD_DB[:user_levels].
          where(user_id: s[:id]).
          and("best_result >= #{ActivityConstants::MINIMUM_PASS_RESULT}").
          count
      end.reduce(:+) / students.count.to_f

      {
        teacher_name: teacher[:name],
        teacher_email: teacher[:email],
        affiliate_name: affiliate[:name],
        affiliate_email: affiliate[:email],
        students_count: students.count,
        students_average_lifetime_days: lifetime.round,
        students_average_levels_completed: levels.round(2)
      }
    end.compact
  end.compact.flatten
end
