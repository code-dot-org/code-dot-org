include FactoryBot::Syntax::Methods

class TestSection
  DEFAULT_TEACHER_EMAIL = 'test_teacher@code.org'
  DEFAULT_TEACHER_PASSWORD = 'test_password'
  DEFAULT_TEACHER_NAME = 'Test Teacher'
  DEFAULT_SECTION_NAME = 'Generated Test Section'
  DEFAULT_NUM_STUDENTS = 10

  DEFAULT_UNIT = 'csp3-2024'
  DEFAULT_COURSE = 'csp-2024'

  def self.seed(options)
    teacher_id = options[:teacher_id] || nil

    teacher = find_or_create_teacher(teacher_id)

    create_section(
      teacher: teacher,
      name: options[:section_name] || DEFAULT_SECTION_NAME,
      login_type: Section::LOGIN_TYPE_PICTURE,
      grade: [2],
      unit_name: options[:unit_name] || DEFAULT_UNIT,
      unit_group_name: options[:unit_group_name] || DEFAULT_COURSE,
      course_name: options[:course_name] || DEFAULT_COURSE,
      num_students: options[:num_students] || DEFAULT_NUM_STUDENTS,
    )
  end

  # If teacher_id is provided, find the teacher by ID and do not delete any data.
  # If no teacher_id is provided, create a new teacher with the default email, name, and password.
  # Hard-delete the to-be-created teacher and all of the teacher's sections and students
  # and recreate. Sections and followers would be soft-deleted by
  # dependency when we delete the teacher; but to not leave a trail of
  # old test data behind, we explictly hard-delete.
  def self.find_or_create_teacher(teacher_id)
    return User.find_by(id: teacher_id) unless teacher_id.nil?

    # Delete any existing test data
    user = User.find_by_email_or_hashed_email(DEFAULT_TEACHER_EMAIL)
    unless user.nil?
      delete_existing_teacher(user)
    end

    # Create the test teacher
    create :teacher, email: DEFAULT_TEACHER_EMAIL, name: DEFAULT_TEACHER_NAME,
      password: DEFAULT_TEACHER_PASSWORD, terms_of_service_version: 1
  end

  def self.delete_existing_teacher(user)
    user.sections_instructed.each do |section|
      # Hard-delete all students in each section.
      section.students.each do |student_user|
        raise "Not a sample student - #{student_user.name}" unless SAMPLE_STUDENT_NAME_REGEX.match?(student_user.name)
        environment_check!
        UserGeo.where(user_id: student_user.id).destroy_all
        student_user.really_destroy!
      end
      # Hard-delete each section.
      section.really_destroy!
    end
    UserGeo.where(user_id: user.id).destroy_all
    # Delete the existing test teacher
    unless (user.name.eql? DEFAULT_TEACHER_NAME) && (user.email.eql? DEFAULT_TEACHER_EMAIL)
      raise "Not a sample teacher - #{user.name}"
    end
    user.really_destroy!
  end

  def self.create_section(options)
    unit = Unit.get_from_cache(options[:unit_name])
    unit_group = UnitGroup.get_from_cache(options[:unit_group_name])

    section = create :section, script: unit, unit_group: unit_group,
      **options.slice(:teacher, :name, :login_type, :grade)

    section
  end
end
