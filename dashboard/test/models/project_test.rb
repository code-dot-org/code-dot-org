require 'test_helper'

class ProjectTest < ActiveSupport::TestCase
  test "Projects must be 30 minutes old to publish" do
    project = create :project
    refute project.existed_long_enough_to_publish?

    project.created_at = Time.now - 31.minutes

    assert project.existed_long_enough_to_publish?
  end

  test "Project owner account must have existed for a week to publish" do
    project_owner = create :student
    project = create :project, owner: project_owner
    refute project.owner_existed_long_enough_to_publish?

    project_owner = create :student, created_at: Time.now - 8.days
    project = create :project, owner: project_owner

    assert project.owner_existed_long_enough_to_publish?
  end

  test "Publish age limits do not apply to Hour of Code projects" do
    Unit.any_instance.stubs(:hoc?).returns(true)
    hoc_script = create :hoc_script
    project = create :project
    create :channel_token, script: hoc_script, storage_app_id: project.id

    refute project.apply_project_age_publish_limits?
  end

  test "Publish age limits do not apply to students added to sections within last year" do
    follower = create :follower
    project = create :project, owner: follower.student_user
    refute project.apply_project_age_publish_limits?

    follower = create :follower, created_at: Time.now - 2.years
    project = create :project, owner: follower.student_user
    assert project.apply_project_age_publish_limits?
  end

  test "Publish age limits do not apply to teachers with students added to their sections within last year" do
    teacher = create :teacher
    create :follower, user: teacher
    project = create :project, owner: teacher
    refute project.apply_project_age_publish_limits?

    teacher = create :teacher
    create :follower, created_at: Time.now - 2.years, user: teacher
    project = create :project, owner: teacher
    assert project.apply_project_age_publish_limits?
  end

  test "Publish age limits do not apply to admins with project validator permissions" do
    project_validator = create :project_validator
    project = create :project, owner: project_validator
    refute project.apply_project_age_publish_limits?
  end
end
