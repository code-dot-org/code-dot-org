require 'test_helper'

class Pd::TeacherApplicationTest < ActiveSupport::TestCase
  setup do
    # unless explicitly stubbed
    PEGASUS_DB.expects(:[]).never
  end

  test 'required field validations' do
    teacher_application = Pd::TeacherApplication.new
    refute teacher_application.valid?
    assert_equal [
      'User is required',
      'Application is required',
      'Primary email is required',
      'Secondary email is required'
    ], teacher_application.errors.full_messages

    teacher_application.user = create :teacher
    teacher_application.application = build(:pd_teacher_application_hash).to_json
    teacher_application.primary_email = teacher_application.user.email
    teacher_application.secondary_email = 'teacher+tag@my.school.edu'

    assert teacher_application.valid?
  end

  test 'primary email must match user email' do
    teacher = create :teacher
    application = build :pd_teacher_application, user: teacher, primary_email: 'mismatch@example.net'

    refute application.valid?
    assert_equal 1, application.errors.count
    assert_equal(
      'Primary email must match your login. If you want to use this email instead, '\
        'first update it in <a href="/users/edit">account settings</a>.',
      application.errors.full_messages.first
    )

    application.primary_email = teacher.email
    assert application.valid?
  end

  test 'required application field validations' do
    teacher_application = build :pd_teacher_application
    teacher_application.application_hash = {}

    refute teacher_application.valid?
    # Three fields are validated outside the list of validated fields
    assert_equal Pd::TeacherApplication::REQUIRED_APPLICATION_FIELDS.count, teacher_application.errors.count
    assert teacher_application.errors.full_messages.all? {|m| m.include? 'Application must contain'}

    teacher_application.application = build(:pd_teacher_application_hash).to_json
    assert teacher_application.valid?
  end

  test 'user unique constraint' do
    teacher = create :teacher
    create :pd_teacher_application, user: teacher

    # The same user cannot create another application.
    assert_raises ActiveRecord::RecordNotUnique do
      create :pd_teacher_application, user: teacher
    end

    # Other users can add applications.
    create :pd_teacher_application
  end

  test 'email format validation' do
    e = assert_raises ActiveRecord::RecordInvalid do
      create :pd_teacher_application, primary_email: 'invalid@ example.net'
    end
    assert e.message.include? 'Validation failed: Primary email does not appear to be a valid e-mail address'

    e = assert_raises ActiveRecord::RecordInvalid do
      create :pd_teacher_application, secondary_email: 'invalid@ example.net'
    end
    assert_equal 'Validation failed: Secondary email does not appear to be a valid e-mail address', e.message

    application = create :pd_teacher_application
    hash = application.application_hash
    hash['principalEmail'] = 'invalid@ example.net'

    e = assert_raises ActiveRecord::RecordInvalid do
      application.update!(application: hash.to_json)
    end
    assert_equal 'Validation failed: Principal email does not appear to be a valid e-mail address', e.message
  end

  test 'setting application hash sets email fields' do
    teacher_application = Pd::TeacherApplication.new
    application_hash = build :pd_teacher_application_hash
    teacher_application.application_hash = application_hash

    assert_equal application_hash, teacher_application.application_hash
    assert_equal application_hash['primaryEmail'], teacher_application.primary_email
    assert_equal application_hash['secondaryEmail'], teacher_application.secondary_email
  end

  test 'setting application json sets email fields' do
    teacher_application = Pd::TeacherApplication.new
    application_hash = build :pd_teacher_application_hash
    application_json = application_hash.to_json
    teacher_application.application_json = application_json

    assert_equal application_json, teacher_application.application_json
    assert_equal application_hash['primaryEmail'], teacher_application.primary_email
    assert_equal application_hash['secondaryEmail'], teacher_application.secondary_email
  end

  test 'json hash convenience methods' do
    teacher_application = create :pd_teacher_application
    hash = teacher_application.application_hash
    json = teacher_application.application_json
    assert_equal json, hash.to_json
    assert_equal hash, JSON.parse(json)
  end

  test 'school by id' do
    school = create :public_school, name: "School #{SecureRandom.hex(10)}"
    teacher_application = build :pd_teacher_application, application: {school: school.id}.to_json
    assert_equal school, teacher_application.school
    assert_equal school.name, teacher_application.school_name
  end

  test 'custom school name' do
    school_name = "School #{SecureRandom.hex(10)}"
    teacher_application = build :pd_teacher_application, application: {'school-name': school_name}.to_json
    assert_nil teacher_application.school
    assert_equal school_name, teacher_application.school_name
  end

  test 'school district by id' do
    school_district = create :school_district, name: "District #{SecureRandom.hex(10)}"
    teacher_application = build :pd_teacher_application, application: {'school-district': school_district.id}.to_json
    assert_equal school_district, teacher_application.school_district
    assert_equal school_district.name, teacher_application.school_district_name
  end

  test 'custom school district' do
    school_district_name = "District #{SecureRandom.hex(10)}"
    teacher_application = build :pd_teacher_application, application: {'school-district-name': school_district_name}.to_json
    assert_nil teacher_application.school_district
    assert_equal school_district_name, teacher_application.school_district_name
  end

  test 'validate selected course' do
    teacher_application = build :pd_teacher_application, selected_course: 'invalid'

    refute teacher_application.valid?
    assert_equal 1, teacher_application.errors.count
    assert_equal 'Selected course is not included in the list', teacher_application.errors.full_messages.first
  end

  test 'program name' do
    teacher_application = build :pd_teacher_application, selected_course: 'csd'
    assert_equal 'CS Discoveries', teacher_application.program_name

    teacher_application.selected_course = 'csp'
    assert_equal 'CS Principles', teacher_application.program_name
  end

  test 'approval form url parameters' do
    application_hash = build :pd_teacher_application_hash
    application_hash['firstName'] = 'ignore'
    application_hash['preferredFirstName'] = 'Severus'
    application_hash['lastName'] = 'Snape'
    teacher_application = build :pd_teacher_application, application_hash: application_hash, id: 123

    School.expects(find: build(:public_school, name: 'Hogwarts School of Witchcraft & Wizardry')).times(2)

    # The spaces and '&' should be properly url_encoded
    expected_params = 'entry.1124819666=Severus+Snape&entry.1772278630=Hogwarts+School+of+Witchcraft+%26+Wizardry&entry.2063346846=123'

    # CSD
    teacher_application.selected_course = 'csd'
    expected_url = "https://docs.google.com/forms/d/e/1FAIpQLSdcR6oK-JZCtJ7LR92MmNsRheZjODu_Qb-MVc97jEgxyPk24A/viewform?#{expected_params}"
    assert_equal expected_url, teacher_application.approval_form_url

    # CSP
    teacher_application.selected_course = 'csp'
    expected_url = "https://docs.google.com/forms/d/e/1FAIpQLScVReYg18EYXvOFN2mQkDpDFgoVqKVv0bWOSE1LFSY34kyEHQ/viewform?#{expected_params}"
    assert_equal expected_url, teacher_application.approval_form_url
  end

  test 'regional partner no course' do
    regional_partner = create :regional_partner
    school_district = create :school_district
    create :regional_partners_school_district, school_district: school_district, regional_partner: regional_partner

    # noise: extra partners that should not match below because they're not first
    3.times do
      create :regional_partners_school_district, school_district: school_district, regional_partner: create(:regional_partner)
    end

    teacher_application = build :pd_teacher_application, application: {'school-district': school_district.id}.to_json

    assert_equal regional_partner, teacher_application.regional_partner
    assert_equal regional_partner.name, teacher_application.regional_partner_name
  end

  test 'regional partner with course' do
    regional_partner = create :regional_partner
    school_district = create :school_district

    # noise: extra partners with no course that should not match below
    3.times do
      create :regional_partners_school_district, school_district: school_district, regional_partner: regional_partner
    end

    create :regional_partners_school_district, school_district: school_district, regional_partner: regional_partner, course: 'csd'

    teacher_application = build :pd_teacher_application, application: {'school-district': school_district.id}.to_json

    assert_equal regional_partner, teacher_application.regional_partner
    assert_equal regional_partner.name, teacher_application.regional_partner_name
  end

  test 'regional partner override' do
    teacher_application = build :pd_teacher_application
    old_partner_name = 'old partner'
    new_partner_name = 'new partner'

    teacher_application.expects(:regional_partner).at_least_once.returns(stub(name: old_partner_name))
    assert_equal old_partner_name, teacher_application.regional_partner_name

    # Setting the override to the existing district-matched partner name is a no-op
    teacher_application.regional_partner_override = old_partner_name
    assert_nil teacher_application.regional_partner_override

    teacher_application.regional_partner_override = new_partner_name
    teacher_application.unstub(:regional_partner)
    teacher_application.expects(:regional_partner).never
    assert_equal new_partner_name, teacher_application.regional_partner_name
  end

  test 'accidental student accounts are upgraded to teacher on save' do
    email = 'a_teacher@school.edu'
    accidental_student = create :student, email: email
    application = build :pd_teacher_application, user: accidental_student, primary_email: email
    refute accidental_student.teacher?
    assert accidental_student.email.blank?

    application.save!
    assert accidental_student.teacher?
    assert_equal email, accidental_student.email
  end

  test 'setting accepted_workshop creates an accepted program entry' do
    application = create :pd_teacher_application
    assert_creates Pd::AcceptedProgram do
      application.update!(accepted_workshop: '2017: workshop')
    end

    accepted_program = application.accepted_program
    assert accepted_program
    assert_equal '2017: workshop', accepted_program.workshop_name
    assert_equal application.selected_course, accepted_program.course
    assert_equal application.user_id, accepted_program.user_id
    assert_equal application.id, accepted_program.teacher_application_id
  end

  test 'accepted_workshop format validation' do
    application = build :pd_teacher_application, accepted_workshop: 'invalid'
    refute application.valid?
    assert_equal(
      ['Accepted workshop is not a valid format. Expected "dates : location" for teachercon, or "partner : dates" for a partner workshop'],
      application.errors.full_messages
    )
  end

  test 'setting accepted workshop fails when an accepted program already exists for that user and course' do
    teacher = create :teacher
    application = create :pd_teacher_application, user: teacher, selected_course: 'csd'
    create :pd_accepted_program, user: teacher, course: 'csd'

    application.accepted_workshop = '2017: workshop'

    refute application.save
    assert_equal(
      ['Accepted program user already has an entry for this course'],
      application.errors.full_messages
    )
  end

  test 'reassigning accepted_workshop updates existing accepted program entry' do
    application = create :pd_teacher_application
    accepted_program = create :pd_accepted_program, workshop_name: '2017 : original workshop', teacher_application: application
    assert_does_not_create Pd::AcceptedProgram do
      application.update!(accepted_workshop: '2017 : another workshop')
    end

    accepted_program.reload
    assert_equal '2017 : another workshop', accepted_program.workshop_name
    assert_equal '2017 : another workshop', application.accepted_workshop
  end

  test 'setting accepted_workshop to nil destroys existing accepted program entry' do
    application = create :pd_teacher_application
    accepted_program = create :pd_accepted_program, teacher_application: application

    assert_destroys(Pd::AcceptedProgram) do
      application.update!(accepted_workshop: nil)
    end
    refute Pd::AcceptedProgram.exists?(accepted_program.id)

    # idempotence
    assert_does_not_destroy(Pd::AcceptedProgram) do
      application.update!(accepted_workshop: nil)
    end
  end

  test 'setting accepted_workshop with no user is invalid' do
    application = build :pd_teacher_application, user: nil
    application.accepted_workshop = '2017: workshop'
    refute application.valid?
    refute application.save
  end

  test 'program_registration data is retrieved and parsed from pegasus forms' do
    application = create :pd_teacher_application
    mock_query_result = mock_pegasus_program_registration_query application.id

    mock_query_result.expects(:first).returns(nil).twice
    2.times do
      assert_nil application.program_registration
    end

    fake_form_data = '{"field1": "value1", "field2": "value2"}'
    mock_query_result.expects(:first).returns({data: fake_form_data}).once
    expected_result = {
      field1: 'value1',
      field2: 'value2'
    }

    # idempotence: once retrieved, it won't query again (tested by .once expectation above)
    2.times do
      assert_equal expected_result, application.program_registration
    end

    # after reload, it must be loaded again
    application.reload
    mock_query_result.expects(:first).returns({data: fake_form_data}).once
    assert_equal expected_result, application.program_registration
  end

  test 'program_registration override' do
    application = create :pd_teacher_application
    application.stubs(:accepted_program).returns(stub(teachercon?: true))
    mock_query_result = mock_pegasus_program_registration_query application.id

    # never query
    mock_query_result.expects(:first).never

    application.program_registration = nil
    assert_nil application.program_registration

    mock_query_result.expects(:delete)
    Pd::ProgramRegistrationValidation.expects(:validate).never
    application.save!

    registration_data = {key: 'value'}
    application.program_registration = registration_data
    assert_equal registration_data, application.program_registration
    Pd::ProgramRegistrationValidation.expects(:validate).with(registration_data)
    mock_query_result.expects(:update)
    application.save!
  end

  test 'updating program_registration_json updates the program registration' do
    application = create :pd_teacher_application
    application.stubs(:accepted_program).returns(stub(teachercon?: true))
    application.stubs(:school_district)
    mock_pegasus_program_registration_query application.id
    fake_registration = {key: 'value'}
    valid_registration_json = fake_registration.to_json
    formatted_json = JSON.pretty_generate fake_registration

    application.program_registration_json = valid_registration_json
    assert_equal formatted_json, application.program_registration_json

    # registration includes automatic keys
    expected_keys = %w(
      key
      email_s name_s user_id_i first_name_s last_name_s phone_number_s
      pd_teacher_application_id_i school_district_s selected_course_s accepted_workshop_s
    ).map(&:to_sym)
    assert_equal expected_keys, application.program_registration.keys
    Pd::ProgramRegistrationValidation.expects(:validate)
    assert application.valid?

    # invalid
    form_error = FormError.new 'Pd::ProgramRegistrationValidation', {key: :invalid}
    Pd::ProgramRegistrationValidation.expects(:validate).raises(form_error)
    application.program_registration_json = valid_registration_json
    refute application.valid?
    assert_equal ['Program registration json contains errors: key: invalid'], application.errors.full_messages

    # Delete by setting to blank
    application.program_registration_json = ''
    assert_nil application.program_registration
    Pd::ProgramRegistrationValidation.expects(:validate).never
    assert application.valid?

    # unparseable
    application.program_registration_json = 'unparseable as json'
    assert_nil application.program_registration
    refute application.valid?
    assert_equal ['Program registration json is not valid JSON'], application.errors.full_messages
    # the raw unparsed json is stored
    assert_equal 'unparseable as json', application.program_registration_json
  end

  test 'email field assignments match application' do
    primary_email_1 = 'primary1@school.edu'
    secondary_email_1 = 'secondary1@school.edu'
    application = build :pd_teacher_application, primary_email: primary_email_1, secondary_email: secondary_email_1

    assert_equal primary_email_1, application.application_hash['primaryEmail']
    assert_equal primary_email_1, application.primary_email
    assert_equal secondary_email_1, application.application_hash['secondaryEmail']
    assert_equal secondary_email_1, application.secondary_email

    # Verify new direct fields values are reflected in the application
    primary_email_2 = 'primary2@school.edu'
    secondary_email_2 = 'secondary2@school.edu'
    application.primary_email = primary_email_2
    assert_equal primary_email_2, application.application_hash['primaryEmail']
    application.secondary_email = secondary_email_2
    assert_equal secondary_email_2, application.application_hash['secondaryEmail']

    # Verify new application values are reflected in the direct fields
    primary_email_3 = 'primary3@school.edu'
    secondary_email_3 = 'secondary3@school.edu'
    application.update_application_hash(primaryEmail: primary_email_3, secondaryEmail: secondary_email_3)
    assert_equal primary_email_3, application.primary_email
    assert_equal secondary_email_3, application.secondary_email

    # Finally, verify non-email fields in the application do not modify the direct email fields
    application.selected_course = 'csp'
    assert_equal primary_email_3, application.primary_email
    assert_equal secondary_email_3, application.secondary_email
  end

  test 'primary email and user must match validation runs only when they change' do
    teacher_1 = create :teacher
    teacher_2 = create :teacher
    extraneous_teacher = create :teacher
    application = build :pd_teacher_application, user: teacher_1, primary_email: teacher_2.email

    # Initially invalid because the emails don't match.
    # Save without validating as if it were an old application before this rule existed
    refute application.valid?
    application.save(validate: false)

    # Now, without changing anything, it should be valid
    application.reload
    assert application.valid?

    # Changing move_to_user will run the validation
    application.move_to_user = extraneous_teacher.id
    refute application.valid?
    application.move_to_user = teacher_2.id
    assert application.valid?

    # Same with changing the primary_email
    application.reload
    application.primary_email = extraneous_teacher.email
    refute application.valid?
    application.primary_email = teacher_1.email
    assert application.valid?

    # Or changing the user directly
    application.reload
    application.user = extraneous_teacher
    refute application.valid?
    application.user = teacher_2
    assert application.valid?

    # But changing other fields will skip the user / email validation
    application.reload
    application.secondary_email = 'another@email.com'
    assert application.valid?
  end

  test 'emails are downcased before validation' do
    application = build(
      :pd_teacher_application,
      primary_email: 'MixedCase@Example.Net',
      secondary_email: 'AlsoMixed@Example.Net'
    )

    application.validate
    assert_equal 'mixedcase@example.net', application.primary_email
    assert_equal 'alsomixed@example.net', application.secondary_email
  end

  test 'move_to_user by email' do
    application = create :pd_teacher_application
    new_teacher = create :teacher

    assert application.update move_to_user: new_teacher.email, primary_email: new_teacher.email
    assert_equal new_teacher, application.user
  end

  test 'move_to_user by id' do
    application = create :pd_teacher_application
    new_teacher = create :teacher

    assert application.update move_to_user: new_teacher.id, primary_email: new_teacher.email
    assert_equal new_teacher, application.user
  end

  test 'move_to_user must be a real user' do
    application = create :pd_teacher_application

    application.move_to_user = 'nonexistent'
    refute application.valid?
    assert_equal 1, application.errors.count
    assert_equal 'Move to user not found', application.errors.full_messages.first
  end

  test 'move_to_user must have an email that matches the primary_email' do
    application = create :pd_teacher_application
    new_user = create :teacher
    application.move_to_user = new_user.email

    refute application.valid?
    assert_equal 1, application.errors.count
    assert_equal(
      'Move to user must match primary email. If you intend to move to this user, '\
        "also update the primary_email to #{new_user.email}",
      application.errors.full_messages.first
    )
  end

  test 'move_to_user email must not have a conflicting teacher application' do
    teacher = create :teacher
    new_teacher = create :teacher
    conflicting_application = create :pd_teacher_application, user: new_teacher
    application = create :pd_teacher_application, user: teacher

    application.move_to_user = new_teacher.email
    application.primary_email = new_teacher.email

    refute application.valid?
    assert_equal 1, application.errors.count
    assert_equal(
      "Move to user already has a teacher application, id: #{conflicting_application.id}",
      application.errors.full_messages.first
    )
  end

  private

  # @param application_id [Integer] teacher application id
  # @return [mock] mock pegasus query result for the PdProgramRegistration form associated with the
  # supplied teacher application id (as source_id)
  def mock_pegasus_program_registration_query(application_id)
    mock_forms_table = mock
    mock_query_result = mock
    PEGASUS_DB.stubs(:[]).with(:forms).returns(mock_forms_table)
    mock_forms_table.stubs(:where).with(kind: 'PdProgramRegistration', source_id: application_id).
      returns(mock_query_result)

    mock_query_result
  end
end
