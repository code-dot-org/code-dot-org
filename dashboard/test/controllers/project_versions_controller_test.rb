require 'test_helper'

class ProjectVersionsControllerTest < ActionController::TestCase
  test "can create project version" do
    student = create :student
    sign_in student

    fake_storage_id = 123
    fake_project_id = 654
    fake_channel_id = 'abcdef'
    @controller.expects(:user_id_for_storage_id).with(fake_storage_id).returns(student.id)
    @controller.expects(:storage_decrypt_channel_id).with(fake_channel_id).returns([fake_storage_id, fake_project_id])

    assert_creates(ProjectVersion) do
      post :create, params: {storage_id: fake_channel_id, version_id: 'fghj', comment: 'This is a comment'}
    end
    project_version = ProjectVersion.find_by(project_id: fake_project_id, object_version_id: 'fghj')
    assert_not_nil project_version
    assert_equal 'This is a comment', project_version.comment
  end

  test "can fetch project versions of own project" do
    student = create :student
    sign_in student

    fake_storage_id = 123
    fake_project_id = 654
    fake_channel_id = 'abcdef'
    @controller.expects(:user_id_for_storage_id).with(fake_storage_id).returns(student.id)
    @controller.expects(:storage_decrypt_channel_id).with(fake_channel_id).returns([fake_storage_id, fake_project_id])

    create :project_version, project_id: fake_project_id, comment: "First comment", created_at: 2.days.ago
    create :project_version, project_id: fake_project_id, comment: "Second comment", created_at: 1.day.ago
    create :project_version, project_id: fake_project_id, comment: "Third comment"

    get :project_commits, params: {channel_id: fake_channel_id}
    assert_response :ok

    returned_commits = JSON.parse(@response.body)
    assert_equal 3, returned_commits.length
    assert_equal ['Third comment', 'Second comment', 'First comment'], returned_commits.map {|c| c['comment']}
  end

  test "versions more than a year old have isVersionExpired set to true" do
    student = create :student
    sign_in student

    fake_storage_id = 123
    fake_project_id = 654
    fake_channel_id = 'abcdef'
    @controller.expects(:user_id_for_storage_id).with(fake_storage_id).returns(student.id)
    @controller.expects(:storage_decrypt_channel_id).with(fake_channel_id).returns([fake_storage_id, fake_project_id])

    create :project_version, project_id: fake_project_id, comment: "First comment", created_at: 2.years.ago
    create :project_version, project_id: fake_project_id, comment: "Second comment", created_at: 2.days.ago

    get :project_commits, params: {channel_id: fake_channel_id}
    assert_response :ok

    returned_commits = JSON.parse(@response.body)
    assert_equal 2, returned_commits.length
    refute returned_commits.first['isVersionExpired']
    assert returned_commits.last['isVersionExpired']
  end

  test "can fetch project versions of students project if their teacher" do
    teacher = create :teacher
    section = create :section, user: teacher
    student = create(:follower, section: section).student_user
    sign_in teacher

    fake_storage_id = 123
    fake_project_id = 654
    fake_channel_id = 'abcdef'
    @controller.expects(:user_id_for_storage_id).with(fake_storage_id).returns(student.id)
    @controller.expects(:storage_decrypt_channel_id).with(fake_channel_id).returns([fake_storage_id, fake_project_id])

    create :project_version, project_id: fake_project_id, comment: "Third comment"

    get :project_commits, params: {channel_id: fake_channel_id}
    assert_response :ok
  end

  test "can fetch project versions of another students project if in the same code review group" do
    section = create :section, code_review_expires_at: 1.year.from_now
    group = create :code_review_group, section: section

    project_owner_student = create :student
    follower1 = create :follower, section: section, student_user: project_owner_student
    create :code_review_group_member, code_review_group: group, follower: follower1

    student_reviewer = create :student
    follower2 = create :follower, section: section, student_user: student_reviewer
    create :code_review_group_member, code_review_group: group, follower: follower2
    sign_in student_reviewer

    fake_storage_id = 123
    fake_project_id = 654
    fake_channel_id = 'abcdef'
    @controller.expects(:user_id_for_storage_id).with(fake_storage_id).returns(project_owner_student.id)
    @controller.expects(:storage_decrypt_channel_id).with(fake_channel_id).returns([fake_storage_id, fake_project_id])
    create :reviewable_project, user_id: project_owner_student.id, project_id: fake_project_id

    create :project_version, project_id: fake_project_id, comment: "Third comment"

    get :project_commits, params: {channel_id: fake_channel_id}
    assert_response :ok
  end

  test "cannot fetch project versions of a user who isnt in the same code review group" do
    section = create :section, code_review_expires_at: 1.year.from_now
    project_owner_student = create :student
    group1 = create :code_review_group, section: section
    follower1 = create :follower, section: section, student_user: project_owner_student
    create :code_review_group_member, code_review_group: group1, follower: follower1

    student_reviewer = create :student
    group2 = create :code_review_group, section: section
    follower2 = create :follower, section: section, student_user: student_reviewer
    create :code_review_group_member, code_review_group: group2, follower: follower2
    sign_in student_reviewer

    fake_storage_id = 123
    fake_project_id = 654
    fake_channel_id = 'abcdef'
    @controller.expects(:user_id_for_storage_id).with(fake_storage_id).returns(project_owner_student.id)
    @controller.expects(:storage_decrypt_channel_id).with(fake_channel_id).returns([fake_storage_id, fake_project_id])
    create :reviewable_project, user_id: project_owner_student.id, project_id: fake_project_id

    create :project_version, project_id: fake_project_id, comment: "Third comment"

    get :project_commits, params: {channel_id: fake_channel_id}
    assert_response :not_found
  end
end
