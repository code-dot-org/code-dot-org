require 'test_helper'

class Services::Lti::AccountLinkerTest < ActiveSupport::TestCase
  setup do
    @user = create :teacher
    @session = {}
    @lti_integration = create :lti_integration
  end

  test 'reassigns an auth option from a partial registration to an existing user' do
    partial_lti_teacher = create :teacher
    ao = create :lti_authentication_option
    fake_id_token = {iss: @lti_integration.issuer, aud: @lti_integration.client_id, sub: 'foo'}
    auth_id = Services::Lti::AuthIdGenerator.new(fake_id_token).call
    ao.update(authentication_id: auth_id)
    partial_lti_teacher.authentication_options = [ao]
    PartialRegistration.persist_attributes @session, partial_lti_teacher
    assert_equal 1, @user.authentication_options.count
    refute Policies::Lti.lti?(@user)

    Services::Lti::AccountLinker.call(user: @user, session: @session)
    assert_equal 2, @user.reload.authentication_options.count
    assert Policies::Lti.lti?(@user)
  end

  test 'sets the lti_roster_sync_enabled and lms_landing_opted_out properties on the user' do
    partial_lti_teacher = create :teacher
    ao = create :lti_authentication_option
    fake_id_token = {iss: @lti_integration.issuer, aud: @lti_integration.client_id, sub: 'foo'}
    auth_id = Services::Lti::AuthIdGenerator.new(fake_id_token).call
    ao.update(authentication_id: auth_id)
    partial_lti_teacher.authentication_options = [ao]
    PartialRegistration.persist_attributes @session, partial_lti_teacher
    Services::Lti::AccountLinker.call(user: @user, session: @session)

    assert_equal true, @user.reload.lti_roster_sync_enabled
    assert_equal true, @user.lms_landing_opted_out
  end

  test 'Swaps the existing user into the defunct user\'s sections' do
    new_student = create :student
    existing_student = create :student
    lti_course = create :lti_course, lti_integration: @lti_integration
    lti_section = create :lti_section, lti_course: lti_course
    lti_section.section.students << new_student

    ao = create :lti_authentication_option
    fake_id_token = {iss: @lti_integration.issuer, aud: @lti_integration.client_id, sub: 'foo'}
    auth_id = Services::Lti::AuthIdGenerator.new(fake_id_token).call
    ao.update(authentication_id: auth_id)
    new_student.authentication_options = [ao]
    PartialRegistration.persist_attributes @session, new_student
    assert_equal 1, existing_student.authentication_options.count
    refute Policies::Lti.lti?(existing_student)

    Services::Lti::AccountLinker.call(user: existing_student, session: @session)
    assert_equal 2, existing_student.reload.authentication_options.count
    assert Policies::Lti.lti?(existing_student)
    assert lti_section.section.students.include?(existing_student)
    assert new_student.reload.deleted?
  end

  test 'Swaps the existing user in as a co-teacher' do
    new_teacher = create :teacher
    existing_teacher = create :teacher
    lti_course = create :lti_course, lti_integration: @lti_integration
    lti_section = create :lti_section, lti_course: lti_course
    lti_section.section.add_instructor(new_teacher)

    ao = create :lti_authentication_option
    fake_id_token = {iss: @lti_integration.issuer, aud: @lti_integration.client_id, sub: 'foo'}
    auth_id = Services::Lti::AuthIdGenerator.new(fake_id_token).call
    ao.update(authentication_id: auth_id)
    new_teacher.authentication_options = [ao]
    PartialRegistration.persist_attributes @session, new_teacher
    assert_equal 1, existing_teacher.authentication_options.count
    refute Policies::Lti.lti?(existing_teacher)

    Services::Lti::AccountLinker.call(user: existing_teacher, session: @session)
    assert_equal 2, existing_teacher.reload.authentication_options.count
    assert Policies::Lti.lti?(existing_teacher)
    assert lti_section.section.active_section_instructors.find_by(instructor_id: existing_teacher.id)
    assert new_teacher.reload.deleted?
  end

  test 'Swaps the existing user in as a section owner' do
    new_teacher = create :teacher
    existing_teacher = create :teacher
    lti_course = create :lti_course, lti_integration: @lti_integration
    lti_section = create :lti_section, lti_course: lti_course
    lti_section.section.add_instructor(new_teacher)
    lti_section.section.update(user_id: new_teacher.id)

    ao = create :lti_authentication_option
    fake_id_token = {iss: @lti_integration.issuer, aud: @lti_integration.client_id, sub: 'foo'}
    auth_id = Services::Lti::AuthIdGenerator.new(fake_id_token).call
    ao.update(authentication_id: auth_id)
    new_teacher.authentication_options = [ao]
    PartialRegistration.persist_attributes @session, new_teacher
    assert_equal 1, existing_teacher.authentication_options.count
    refute Policies::Lti.lti?(existing_teacher)

    Services::Lti::AccountLinker.call(user: existing_teacher, session: @session)
    assert_equal 2, existing_teacher.reload.authentication_options.count
    assert Policies::Lti.lti?(existing_teacher)
    assert lti_section.section.reload.active_section_instructors.find_by(instructor_id: existing_teacher.id)
    assert lti_section.section.user_id == existing_teacher.id
    assert new_teacher.reload.deleted?
  end
end
