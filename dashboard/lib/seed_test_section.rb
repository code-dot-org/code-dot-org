include FactoryBot::Syntax::Methods

class SeedTestSection
  def self.seed(options)
    teacher_email = options[:teacher_email] || 'test_teacher@code.org'
    teacher_password = options[:teacher_password] || 'test_password'
    teacher_name = options[:teacher_name] || 'Test Teacher'
    section_name = options[:section_name] || 'Test Section'
    num_students = options[:num_students] || 10

    pp 'lfm', options, {teacher_password: teacher_password, teacher_email: teacher_email, teacher_name: teacher_name, section_name: section_name, num_students: num_students}
    # Create a test teacher
    # teacher = create_teacher(teacher_email, teacher_password, teacher_name)

    # # Create a section with the specified number of students
    # create_section(
    #   teacher: teacher,
    #   name: section_name,
    #   login_type: Section::LOGIN_TYPE_PICTURE,
    #   grade: 2,
    #   age_min: 7,
    #   age_max_inclusive: 9,
    #   script_name: script_name,
    #   num_students: num_students
    # )
  end
end
