require 'test_helper'

class Api::V1::SectionInstructorsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @teacher = create(:teacher)
    @teacher2 = create(:teacher)
    @teacher3 = create(:teacher)
    @section = create(:section, user: @teacher, login_type: 'word')
    @section2 = create(:section, user: @teacher, login_type: 'word')
    # These are auto-created for the section creator
    @former_instructor = create(:section_instructor, section: @section, instructor: @teacher2, status: :removed)
    @former_instructor.destroy!
    @si3 = create(:section_instructor, section: @section2, instructor: @teacher2, status: :active)
    @full_section = create(:section, user: @teacher2, login_type: 'word')
    (Section::INSTRUCTOR_LIMIT - 1).times do
      create(:section_instructor, section: @full_section, instructor: create(:teacher), status: :active)
    end
  end

  test 'logged out user has no section_instructors' do
    get :index
    assert_response :success
    assert_equal '[]', @response.body
  end

  test 'logged in teacher with two sections has two section_instructors' do
    sign_in @teacher
    get :index
    assert_response :success
    assert_equal 2, returned_json.length
  end

  test 'logged in teacher with no sections has no section_instructors' do
    sign_in @teacher3
    get :index
    assert_response :success
    assert_equal '[]', @response.body
  end

  test 'section has a section_instructor' do
    sign_in @teacher
    get :show, params: {section_id: @section.id}
    assert_response :success
    assert_equal 1, returned_json.length
  end

  test 'only assigned instructor can get section_instructors for a section' do
    sign_in @teacher2
    get :show, params: {section_id: @section.id}
    assert_response :forbidden
  end

  test 'instructor can add a teacher to instruct a section' do
    sign_in @teacher
    post :create, params: {section_id: @section.id, email: @teacher3.email}
    assert_response :success
    si = SectionInstructor.last
    assert_equal @teacher3.id, si.instructor_id
    assert_equal @section.id, si.section_id
    assert_equal :invited, si.status.to_sym
    assert_equal @teacher, si.invited_by
  end

  test 'instructor can add a former instructor to instruct a section' do
    sign_in @teacher
    post :create, params: {section_id: @section.id, email: @teacher2.email}
    assert_response :success
    si = SectionInstructor.last
    assert_equal @teacher2.id, si.instructor_id
    assert_equal @section.id, si.section_id
    assert_equal :invited, si.status.to_sym
  end

  test 'instructor cannot add a non-user to instruct a section' do
    sign_in @teacher
    post :create, params: {section_id: @section.id, email: 'test123@fake.com'}
    assert_response :not_found
  end

  test 'instructor receives correct error when adding themself to a section' do
    sign_in @teacher
    post :create, params: {section_id: @section.id, email: @teacher.email}
    assert_response :bad_request
    assert_equal '{"error":"inviting self"}', @response.body
  end

  test 'instructor cannot add a student to instruct a section' do
    sign_in @teacher
    section = create(:section, :teacher_participants, user: @teacher)
    section.add_student(@teacher2)

    post :create, params: {section_id: section.id, email: @teacher2.email}
    assert_response :bad_request
  end

  test 'instructor cannot add a new instructor to a full section' do
    sign_in @teacher2
    post :create, params: {section_id: @full_section.id, email: @teacher3.email}

    assert_response :bad_request
  end

  test 'non-instructor cannot add a teacher to instruct a section' do
    sign_in @teacher2
    post :create, params: {section_id: @section.id, email: @teacher3.email}
    assert_response :forbidden
  end

  test 'instructor can remove other instructor' do
    si = create(:section_instructor, section: @section2, instructor: @teacher3, status: :active)
    sign_in @teacher3
    delete :destroy, params: {id: si.id}
    assert_response :success
    assert si.reload.deleted_at.present?
  end

  test 'non-instructor cannot remove other instructor' do
    sign_in @teacher3
    delete :destroy, params: {id: @si3.id}
    assert_response :forbidden
    assert @si3.reload.deleted_at.nil?
  end

  test 'instructor cannot remove section owner' do
    section = create(:section, user: @teacher, login_type: 'word')
    si = SectionInstructor.find_by(instructor_id: @teacher.id, section_id: section.id)
    create(:section_instructor, section: section, instructor: @teacher2, status: :active)
    sign_in @teacher2
    delete :destroy, params: {id: si.id}
    assert_response :forbidden
    assert si.reload.deleted_at.nil?
  end

  test 'instructor can remove themselves if not section owner' do
    sign_in @teacher2
    delete :destroy, params: {id: @si3.id}
    assert_response :success
    assert @si3.reload.deleted_at.present?
  end

  test 'invited instructor can accept invitation' do
    si = create(:section_instructor, section: @section2, instructor: @teacher3, status: :invited)
    sign_in @teacher3
    put :accept, params: {id: si.id}
    assert_response :success
    assert_equal :active, si.reload.status.to_sym
  end

  test 'active instructor cannot accept invitation' do
    si = create(:section_instructor, section: @section2, instructor: @teacher3, status: :active)
    sign_in @teacher3
    put :accept, params: {id: si.id}
    assert_response :bad_request
  end

  test 'instructor cannot accept invitation for someone else' do
    si = create(:section_instructor, section: @section2, instructor: @teacher3, status: :invited)
    sign_in @teacher2
    put :accept, params: {id: si.id}
    assert_response :forbidden
  end

  test 'invited instructor can decline invitation' do
    si = create(:section_instructor, section: @section2, instructor: @teacher3, status: :invited)
    sign_in @teacher3
    put :decline, params: {id: si.id}
    assert_response :success
    assert_equal :declined, si.reload.status.to_sym
  end

  test 'active instructor cannot decline invitation' do
    si = create(:section_instructor, section: @section2, instructor: @teacher3, status: :active)
    sign_in @teacher3
    put :decline, params: {id: si.id}
    assert_response :bad_request
  end

  test 'instructor cannot decline invitation for someone else' do
    si = create(:section_instructor, section: @section2, instructor: @teacher3, status: :invited)
    sign_in @teacher2
    put :decline, params: {id: si.id}
    assert_response :forbidden
  end

  test 'logged-out user cannot check email addresses' do
    get :check, params: {email: @teacher2.email}
    assert_response :forbidden
  end

  test 'teacher can check other teacher for eligibility' do
    sign_in @teacher
    get :check, params: {email: @teacher2.email}
    assert_response :success
  end

  test 'teacher gets error checking own email address' do
    sign_in @teacher
    get :check, params: {email: @teacher.email}
    assert_response :bad_request
  end

  test 'teacher gets error checking non-user email address' do
    sign_in @teacher
    get :check, params: {email: 'nonsense@nowhere.com'}
    assert_response :not_found
  end

  test 'teacher can check teacher for existing section' do
    sign_in @teacher
    get :check, params: {email: @teacher3.email, section_id: @section2.id}
    assert_response :success
  end

  test 'teacher gets error checking existing co-teacher' do
    sign_in @teacher
    get :check, params: {email: @teacher2.email, section_id: @section2.id}
    assert_response :bad_request
  end

  test 'teacher cannot check adding to a section they do not teach' do
    sign_in @teacher2
    get :check, params: {email: @teacher3.email, section_id: @section.id}
    assert_response :forbidden
  end

  test 'instructor gets error checking for a full section' do
    sign_in @teacher2
    get :check, params: {section_id: @full_section.id, email: @teacher3.email}

    assert_response :bad_request
  end

  # Parsed JSON returned after the last request, for easy assertions.
  # Returned hash has string keys
  def returned_json
    JSON.parse @response.body
  end
end
