require 'test_helper'

class Pd::TeacherApplicationEmailParamsTest < ActiveSupport::TestCase
  setup do
    @teacher_application = create :pd_teacher_application
    @teacher_application.stubs(:regional_partner_name).returns('a partner')
  end

  test 'teachercon rules' do
    @teacher_application.stubs(:accepted_program).returns(stub(teachercon?: true))
    @teacher_application.stubs(:accepted_workshop).returns('June 18 - 23, 2017: Houston')

    email_params = Pd::TeacherApplicationEmailParams.new(@teacher_application)
    rules = email_params.rules
    expected_rule_keys = [
      :decision,
      :name,
      :email,
      :preferred_first_name_s,
      :course_name_s,
      :regional_partner_name_s,
      :teachercon_location_s,
      :teachercon_dates_s
    ]
    assert_equal expected_rule_keys, rules.keys
    assert_equal [:accept_teachercon], rules[:decision][:options]
    assert_equal 'Houston', rules[:teachercon_location_s][:value]
    assert_equal 'June 18 - 23, 2017', rules[:teachercon_dates_s][:value]

    ui_fields = email_params.labeled_rules.map {|k, v| [k, v[:label]]}.to_h
    expected_ui_fields = {
      decision: 'Decision',
      email: 'To'
    }
    assert_equal expected_ui_fields, ui_fields

    validated_keys = rules.select {|_, v| v.key?(:validation)}.keys
    assert_equal [:email], validated_keys
  end

  test 'teachercon final params' do
    @teacher_application.stubs(:accepted_program).returns(stub(teachercon?: true))
    @teacher_application.stubs(:accepted_workshop).returns('June 18 - 23, 2017: Houston')

    email_params = Pd::TeacherApplicationEmailParams.new(@teacher_application, {decision: :accept_teachercon})

    expected_final_params = {
      decision: 'accept_teachercon',
      name: @teacher_application.teacher_name,
      email: @teacher_application.primary_email,
      preferred_first_name_s: @teacher_application.teacher_first_name,
      course_name_s: @teacher_application.program_name,
      regional_partner_name_s: @teacher_application.regional_partner_name,
      teachercon_location_s: 'Houston',
      teachercon_dates_s: 'June 18 - 23, 2017'
    }
    assert_equal expected_final_params, email_params.to_final_params
  end

  test 'teachercon errors' do
    @teacher_application.stubs(:accepted_program).returns(stub(teachercon?: true))
    @teacher_application.stubs(:accepted_workshop).returns('June 18 - 23, 2017: Houston')

    email_params = Pd::TeacherApplicationEmailParams.new(@teacher_application, {decision: 'invalid'})
    refute email_params.valid?
    assert_equal(
      {'Decision' => 'is not included in the options'},
      email_params.errors
    )

    e = assert_raises RuntimeError do
      email_params.to_final_params
    end
    assert_equal 'Must be valid before constructing final params. See errors', e.message
  end

  test 'partner rules' do
    @teacher_application.stubs(:accepted_program).returns(stub(teachercon?: false))
    @teacher_application.stubs(:accepted_workshop).returns('Code Partner : July 1 - July 5, 2017')

    email_params = Pd::TeacherApplicationEmailParams.new(@teacher_application)
    rules = email_params.rules
    expected_rule_keys = [
      :decision,
      :name,
      :email,
      :preferred_first_name_s,
      :course_name_s,
      :regional_partner_name_s,
      :workshop_dates_s,
      :regional_partner_contact_person_s,
      :regional_partner_contact_person_email_s,
      :workshop_id_i
    ]
    assert_equal expected_rule_keys, rules.keys
    assert_equal [:accept_partner], rules[:decision][:options]
    assert_equal 'Code Partner', rules[:regional_partner_name_s][:value]
    assert_equal 'July 1 - July 5, 2017', rules[:workshop_dates_s][:value]

    ui_fields = email_params.labeled_rules.map {|k, v| [k, v[:label]]}.to_h
    expected_ui_fields = {
      decision: 'Decision',
      email: 'To',
      regional_partner_contact_person_s: 'Partner Contact',
      regional_partner_contact_person_email_s: 'Partner Email',
      workshop_id_i: 'Workshop Id'
    }
    assert_equal expected_ui_fields, ui_fields

    validated_keys = rules.select {|_, v| v.key?(:validation)}.keys
    expected_validated_keys = [
      :email,
      :regional_partner_contact_person_email_s,
      :workshop_id_i
    ]
    assert_equal expected_validated_keys, validated_keys

    transformed_keys = rules.select {|_, v| v.key?(:transform)}.keys
    assert_equal [:workshop_id_i], transformed_keys

    assert_equal(
      [
        :workshop_registration_url_s,
        'https://studio.code.org/pd/workshops/12345/enroll'
      ],
      rules[:workshop_id_i][:transform].call(:workshop_id_i, 12345)
    )
  end

  test 'partner final params' do
    @teacher_application.stubs(:accepted_program).returns(stub(teachercon?: false))
    @teacher_application.stubs(:accepted_workshop).returns('Workshop Partner Org : July 1 - July 5, 2017')
    Pd::Workshop.expects(:exists?).with('1234').returns(true)

    value_overrides = {
      decision: :accept_partner,
      regional_partner_contact_person_s: 'Perry Partner',
      regional_partner_contact_person_email_s: 'perry.partner@a.school.edu',
      workshop_id_i: 1234
    }
    email_params = Pd::TeacherApplicationEmailParams.new(@teacher_application, value_overrides)

    expected_final_params = {
      decision: 'accept_partner',
      name: @teacher_application.teacher_name,
      email: @teacher_application.primary_email,
      preferred_first_name_s: @teacher_application.teacher_first_name,
      course_name_s: @teacher_application.program_name,
      regional_partner_name_s: 'Workshop Partner Org',
      workshop_dates_s: 'July 1 - July 5, 2017',
      regional_partner_contact_person_s: 'Perry Partner',
      regional_partner_contact_person_email_s: 'perry.partner@a.school.edu',
      workshop_registration_url_s: 'https://studio.code.org/pd/workshops/1234/enroll'
    }
    assert_equal expected_final_params, email_params.to_final_params
  end

  test 'partner errors' do
    @teacher_application.stubs(:accepted_program).returns(stub(teachercon?: false))
    @teacher_application.stubs(:accepted_workshop).returns('Code Partner : July 1 - July 5, 2017')
    Pd::Workshop.expects(:exists?).with('1234').returns(false)

    value_overrides = {
      regional_partner_contact_person_email_s: 'invalid',
      workshop_id_i: 1234
    }
    email_params = Pd::TeacherApplicationEmailParams.new(@teacher_application, value_overrides)

    refute email_params.valid?
    assert_equal(
      {
        'Workshop Id' => 'does not exist',
        'Decision' => 'is required',
        'Partner Contact' => 'is required',
        'Partner Email' => 'does not appear to be a valid e-mail address'
      },
      email_params.errors
    )

    e = assert_raises RuntimeError do
      email_params.to_final_params
    end
    assert_equal 'Must be valid before constructing final params. See errors', e.message
  end

  test 'decline and waitlist rules' do
    email_params = Pd::TeacherApplicationEmailParams.new(@teacher_application)
    rules = email_params.rules
    expected_rule_keys = [
      :decision,
      :name,
      :email,
      :preferred_first_name_s,
      :course_name_s,
      :regional_partner_name_s,
      :teacher_application_id_s
    ]
    assert_equal expected_rule_keys, rules.keys
    assert_equal [:waitlist, :decline_csd], rules[:decision][:options]
    assert_equal @teacher_application.id, rules[:teacher_application_id_s][:value]
  end

  test 'decline and waitlist final params' do
    email_params = Pd::TeacherApplicationEmailParams.new(@teacher_application, {decision: :waitlist})

    expected_final_params = {
      decision: 'waitlist',
      name: @teacher_application.teacher_name,
      email: @teacher_application.primary_email,
      preferred_first_name_s: @teacher_application.teacher_first_name,
      course_name_s: @teacher_application.program_name,
      regional_partner_name_s: @teacher_application.regional_partner_name,
      teacher_application_id_s: @teacher_application.id
    }

    assert_equal expected_final_params, email_params.to_final_params
  end

  test 'decline and waitlist errors' do
    email_params = Pd::TeacherApplicationEmailParams.new(@teacher_application, {decision: :accept_teachercon})
    refute email_params.valid?
    assert_equal(
      {'Decision' => 'is not included in the options'},
      email_params.errors
    )
  end
end
