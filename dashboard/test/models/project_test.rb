require 'test_helper'

class ProjectTest < ActiveSupport::TestCase
  setup_all do
    # Reuse the same project throughout these tests
    # because of poorly understood issues related to database locking
    # that arise when using projects in unit tests.
    # Empirically, creating projects as part of a setup_all block seems to work
    # in other tests, so doing the same here.
    # Relevant links:
    # https://codedotorg.atlassian.net/browse/TEACH-230
    # https://github.com/code-dot-org/code-dot-org/pull/46442
    # https://github.com/code-dot-org/code-dot-org/pull/49960
    @project = create :project
  end

  test "Projects must be 30 minutes old to publish" do
    refute @project.existed_long_enough_to_publish?
    @project.created_at = Time.now - 32.minutes
    assert @project.existed_long_enough_to_publish?
  end

  test "Project owner account must have existed for a week to publish" do
    project_owner_new = create :student
    @project.owner = project_owner_new
    refute @project.owner_existed_long_enough_to_publish?

    project_owner_old = create :student, created_at: Time.now - 8.days
    @project.owner = project_owner_old
    assert @project.owner_existed_long_enough_to_publish?
  end

  test "Publish age limits do not apply to Hour of Code projects" do
    Unit.any_instance.stubs(:hoc?).returns(true)
    hoc_script = create :hoc_script
    create :channel_token, script: hoc_script, storage_app_id: @project.id

    refute @project.apply_project_age_publish_limits?
  end

  test "Publish age limits do not apply to students added to sections within last year" do
    follower = create :follower
    @project.owner = follower.student_user
    refute @project.apply_project_age_publish_limits?

    follower = create :follower, created_at: Time.now - 2.years
    @project.owner = follower.student_user
    assert @project.apply_project_age_publish_limits?
  end

  test "Publish age limits do not apply to teachers with students added to their sections within last year" do
    teacher = create :teacher
    create :follower, user: teacher
    @project.owner = teacher
    refute @project.apply_project_age_publish_limits?

    teacher = create :teacher
    create :follower, created_at: Time.now - 2.years, user: teacher
    @project.owner = teacher
    assert @project.apply_project_age_publish_limits?
  end

  test "Publish age limits do not apply to admins with project validator permissions" do
    project_validator = create :project_validator
    @project.owner = project_validator
    refute @project.apply_project_age_publish_limits?
  end
end
