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
    @si1 = @section.instructors.first
    @si2 = @section2.instructors.first
    @former_instructor = create(:section_instructor, section: @section, instructor: @teacher2, status: :removed)
    @former_instructor.destroy!
    @si3 = create(:section_instructor, section: @section2, instructor: @teacher2, status: :active)
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

  test 'instructor cannot add a new instructor to a full section' do
    sign_in @teacher
    create(:section_instructor, section: @section2, instructor: create(:teacher), status: :active)
    create(:section_instructor, section: @section2, instructor: create(:teacher), status: :invited)
    create(:section_instructor, section: @section2, instructor: create(:teacher), status: :declined)
    create(:section_instructor, section: @section2, instructor: create(:teacher), status: :active)
    post :create, params: {section_id: @section2.id, email: @teacher3.email}

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
    sign_in @teacher2
    delete :destroy, params: {id: @si2.id}
    assert_response :forbidden
    assert @si2.reload.deleted_at.nil?
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
  # Parsed JSON returned after the last request, for easy assertions.
  # Returned hash has string keys
  def returned_json
    JSON.parse @response.body
  end
end
