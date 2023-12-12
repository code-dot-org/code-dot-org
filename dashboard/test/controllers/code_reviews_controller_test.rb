require 'test_helper'

class CodeReviewsControllerTest < ActionController::TestCase
  # Setting this to true causes some weird db locking issue, possibly due to
  # some writes to the projects table coming from a different connection via
  # sequel.
  self.use_transactional_test_case = false

  setup_all do
    @project_owner = create :student
    @project = create :project, owner: @project_owner
    @channel_id = @project.channel_id
  end

  setup do
    sign_in @project_owner
  end

  test 'index returns both open and closed code reviews' do
    closed_at = DateTime.now
    create :code_review, user_id: @project_owner.id, project_id: @project.id, closed_at: closed_at
    create :code_review, user_id: @project_owner.id, project_id: @project.id, closed_at: closed_at + 1.second
    create :code_review, user_id: @project_owner.id, project_id: @project.id, closed_at: nil

    get :index, params: {
      channelId: @channel_id,
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    assert_equal 3, response_json.length
  end

  test 'create code review' do
    script_id = 42
    level_id = 17
    project_level_id = 23
    project_version = 'abc'

    post :create, params: {
      channelId: @channel_id,
      version: project_version,
      scriptId: script_id,
      levelId: level_id,
      projectLevelId: project_level_id
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    refute_nil response_json['id']
    assert_equal project_version, response_json['version']
    assert_equal true, response_json['isOpen']
    refute_nil response_json['createdAt']
  end

  test 'cannot create multiple open code reviews for the same project' do
    project_version = 'abc'

    post :create, params: {
      channelId: @channel_id,
      version: project_version,
      scriptId: 15,
      levelId: 31,
      projectLevelId: 41
    }
    assert_response :success

    assert_raises ActiveRecord::RecordInvalid do
      post :create, params: {
        channelId: @channel_id,
        version: project_version,
        scriptId: 7,
        levelId: 19,
        projectLevelId: 43
      }
    end
  end

  test 'close review' do
    code_review = create :code_review, user_id: @project_owner.id
    assert code_review.open?

    patch :update, params: {
      id: code_review.id,
      isClosed: true
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    refute response_json[:isOpen]

    code_review.reload
    refute code_review.open?
  end

  test 'update fails when trying to re-open a closed review' do
    code_review = create :code_review, user_id: @project_owner.id, closed_at: DateTime.now
    refute code_review.open?

    patch :update, params: {
      id: code_review.id,
      isClosed: false
    }
    assert_response :bad_request
  end

  test 'peers_with_open_reviews returns correct data' do
    script_id = 91
    level_id = 161
    project_level_id = 101

    student = create :student
    peer = create :student

    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    student_follower = create :follower, section: section, student_user: student
    peer_follower = create :follower, section: section, student_user: peer

    code_review_group = create :code_review_group, section: section
    create :code_review_group_member, follower: student_follower, code_review_group: code_review_group
    create :code_review_group_member, follower: peer_follower, code_review_group: code_review_group

    create :code_review, user_id: peer.id,
      script_id: script_id, level_id: level_id, project_level_id: project_level_id

    sign_in student
    get :peers_with_open_reviews, params: {
      scriptId: script_id,
      projectLevelId: project_level_id
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    assert_equal 1, response_json.length
    assert_equal peer.id, response_json[0]['ownerId']
    assert_equal peer.name, response_json[0]['ownerName']
  end

  test 'peer_user_ids returns students in code review group' do
    # Test includes 6 students
    #   students[0] - student we will query, in section and code review group
    #   students[1] - student in same section and code review group
    #   students[2] - student in same section and code review group
    #   students[3] - student in same section but different code review group
    #   students[4] - student in same section but not in a code review group
    #   students[5] - student not in section

    students = []
    6.times do |i|
      students[i] = create :student
    end

    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    followers = []
    5.times do |i|
      followers[i] = create :follower, section: section, student_user: students[i]
    end

    code_review_group = create :code_review_group, section: section
    3.times do |i|
      create :code_review_group_member, follower: followers[i], code_review_group: code_review_group
    end

    other_code_review_group = create :code_review_group, section: section
    create :code_review_group_member, follower: followers[3], code_review_group: other_code_review_group

    assert_equal [students[1].id, students[2].id], @controller.peer_user_ids(students[0])
  end

  test 'peer_user_ids returns empty array for student not in a section' do
    student = create :student
    assert_empty @controller.peer_user_ids(student)
  end

  test 'peer_user_ids returns empty array for student not in a code review group' do
    student = create :student
    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    create :follower, section: section, student_user: student

    assert_empty @controller.peer_user_ids(student)
  end

  test 'peer_user_ids does not return peers in code review group where code review is not enabled' do
    student = create :student
    peer = create :student

    section = create :section, code_review_expires_at: Time.now.utc - 1.day
    student_follower = create :follower, section: section, student_user: student
    peer_follower = create :follower, section: section, student_user: peer

    code_review_group = create :code_review_group, section: section
    create :code_review_group_member, follower: student_follower, code_review_group: code_review_group
    create :code_review_group_member, follower: peer_follower, code_review_group: code_review_group

    assert_empty @controller.peer_user_ids(student)
  end
end
