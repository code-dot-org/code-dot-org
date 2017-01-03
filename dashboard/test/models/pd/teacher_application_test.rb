require 'test_helper'

class Pd::TeacherApplicationTest < ActiveSupport::TestCase
  test 'required field validations' do
    teacher_application = Pd::TeacherApplication.new
    refute teacher_application.valid?
    assert_equal [
      'User is required',
      'Primary email is required',
      'Secondary email is required',
      'Application is required'
    ], teacher_application.errors.full_messages

    teacher_application.user = create :teacher
    teacher_application.application = build(:pd_teacher_application_hash).to_json
    teacher_application.primary_email = 'teacher@example.net'
    teacher_application.secondary_email = 'teacher+tag@my.school.edu'

    assert teacher_application.valid?
  end

  test 'required application field validations' do
    teacher_application = build :pd_teacher_application, application: {}

    refute teacher_application.valid?
    assert_equal Pd::TeacherApplication::REQUIRED_APPLICATION_FIELDS.count, teacher_application.errors.count
    assert teacher_application.errors.full_messages.all?{|m| m.include? 'Application must contain'}

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
    assert_equal 'Validation failed: Primary email does not appear to be a valid e-mail address', e.message

    e = assert_raises ActiveRecord::RecordInvalid do
      create :pd_teacher_application, secondary_email: 'invalid@ example.net'
    end
    assert_equal 'Validation failed: Secondary email does not appear to be a valid e-mail address', e.message
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
    application_hash = build :pd_teacher_application_hash
    application_hash['selectedCourse'] = 'invalid'
    teacher_application = build :pd_teacher_application, application_hash: application_hash

    refute teacher_application.valid?
    assert_equal 1, teacher_application.errors.count
    assert_equal 'Selected course is not included in the list', teacher_application.errors.full_messages.first
  end

  test 'program name' do
    teacher_application = build :pd_teacher_application

    teacher_application.update_application_hash 'selectedCourse' => 'csd'
    assert_equal 'CS Discoveries', teacher_application.program_name

    teacher_application.update_application_hash 'selectedCourse' => 'csp'
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
    teacher_application.update_application_hash 'selectedCourse' => 'csd'
    expected_url = "https://docs.google.com/forms/d/e/1FAIpQLSdcR6oK-JZCtJ7LR92MmNsRheZjODu_Qb-MVc97jEgxyPk24A/viewform?#{expected_params}"
    assert_equal expected_url, teacher_application.approval_form_url

    # CSP
    teacher_application.update_application_hash 'selectedCourse' => 'csp'
    expected_url = "https://docs.google.com/forms/d/e/1FAIpQLScVReYg18EYXvOFN2mQkDpDFgoVqKVv0bWOSE1LFSY34kyEHQ/viewform?#{expected_params}"
    assert_equal expected_url, teacher_application.approval_form_url
  end
end
