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
    project = build :project, owner: project_owner
    refute project.owner_existed_long_enough_to_publish?

    project_owner = create :student, created_at: Time.now - 8.days
    project = build :project, owner: project_owner
    assert project.owner_existed_long_enough_to_publish?
  end

  test "Hour of Code projects can be published immediately" do
    Unit.any_instance.stubs(:hoc?).returns(true)
    hoc_script = create :hoc_script
    project = create :project
    create :channel_token, script: hoc_script, storage_app_id: project.id

    assert project.existed_long_enough_to_publish?
    assert project.owner_existed_long_enough_to_publish?
  end
end
