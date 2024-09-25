require 'test_helper'

class Lti::V1::SectionsControllerTest < ActionController::TestCase
  setup do
    @user = create(:teacher)
    sign_in @user
  end
  test 'updates section owners' do
    new_owner = create :teacher
    section_one = create :section, user: @user
    section_two = create :section, user: @user
    lti_section_one = create :lti_section, section: section_one
    lti_section_two = create :lti_section, section: section_two
    create :section_instructor, section: section_one, instructor: new_owner
    create :section_instructor, section: section_two, instructor: new_owner

    Metrics::Events.expects(:log_event).with(
      has_entries(
        user: @user,
        event_name: 'lti_section_owner_changed',
        metadata: {
          section_id: section_one.id,
          previous_owner_id: @user.id,
          new_owner_id: new_owner.id,
          lms_name: lti_section_one.lti_course.lti_integration.platform_name,
        },
      )
    )
    Metrics::Events.expects(:log_event).with(
      has_entries(
        user: @user,
        event_name: 'lti_section_owner_changed',
        metadata: {
          section_id: section_two.id,
          previous_owner_id: @user.id,
          new_owner_id: new_owner.id,
          lms_name: lti_section_two.lti_course.lti_integration.platform_name,
        },
      )
    )
    patch :bulk_update_owners, params: {section_owners: {lti_section_one.id => new_owner.id, lti_section_two.id => new_owner.id}.to_json}, format: :json
    assert_response :ok
    assert_equal new_owner.id, section_one.reload.user_id
    assert_equal new_owner.id, section_two.reload.user_id
  end

  test 'does not update section owners if user is not an instructor' do
    other_teacher = create :teacher
    section = create :section, user: other_teacher
    lti_section = create :lti_section, section: section
    Metrics::Events.expects(:log_event).never
    patch :bulk_update_owners, params: {section_owners: {lti_section.id => @user.id}.to_json}, format: :json
    assert_response :forbidden
    assert_equal other_teacher.id, section.reload.user_id
  end

  test 'if the owner is changed, the previous owner remains an instructor' do
    new_owner = create :teacher
    section = create :section, user: @user
    lti_section = create :lti_section, section: section
    create :section_instructor, section: section, instructor: new_owner

    Metrics::Events.expects(:log_event).with(
      has_entries(
        user: @user,
        event_name: 'lti_section_owner_changed',
        metadata: {
          section_id: section.id,
          previous_owner_id: @user.id,
          new_owner_id: new_owner.id,
          lms_name: lti_section.lti_course.lti_integration.platform_name,
        },
      )
    )
    patch :bulk_update_owners, params: {section_owners: {lti_section.id => new_owner.id}.to_json}, format: :json
    assert_response :ok
    refute section.reload.user_id == @user.id
    assert section.instructors.include? @user
  end

  test 'returns a 404 if a section is not found' do
    Metrics::Events.expects(:log_event).never
    patch :bulk_update_owners, params: {section_owners: {'foo' => @user.id}.to_json}, format: :json
    assert_response :not_found
  end
end
