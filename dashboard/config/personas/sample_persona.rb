# frozen_string_literal: true

DemoMode.add_persona 'Teacher' do
  sign_in_as do
    teacher = Teacher.create!(
      name: "Demo Teacher #{SecureRandom.hex(4)}",
      email: "demo_teacher_#{SecureRandom.uuid}@example.com",
      password: DemoMode.current_password,
      user_type: User::TYPE_TEACHER,
      birthday: Date.new(1980, 3, 14),
      locale: 'en-US',
      terms_of_service_version: 1,
    )

    unit = Unit.find_by!(name: 'aif3-2025')
    section = Section.create!(
      name: 'Demo Section',
      user: teacher,
      login_type: 'email',
      participant_type: 'student',
      script_id: unit.id,
      course_id: unit.original_unit_group_id,
    )

    ['Dairy queen', 'Coldstone creamery'].each do |student_name|
      student = Student.create!(
        name: student_name,
        email: "#{student_name.downcase.gsub(' ', '_')}_#{SecureRandom.uuid}@example.com",
        password: '00secret',
        user_type: User::TYPE_STUDENT,
        birthday: Time.zone.today - 15.years,
        locale: 'en-US',
      )
      section.add_student(student)
    end

    teacher
  end

  features << 'Teacher account'
  features << 'Section assigned to aif3-2025'
  features << '2 students: Dairy queen & Coldstone creamery'

  icon :tophat
  callout true

  display_credentials
end
