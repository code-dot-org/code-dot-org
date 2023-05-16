require 'test_helper'

class ProjectTest < ActiveSupport::TestCase
  test "project with valid url is valid" do
    Project.any_instance.stubs(:channel_id).returns('xyz')
    project = build :project, value: {thumbnailUrl: '/v3/files/xyz/.metadata/thumbnail.png'}.to_json
    assert project.valid?
  end

  test "project with invalid thumbnail url is invalid" do
    Project.any_instance.stubs(:channel_id).returns('xyz')
    project = build :project, value: {thumbnailUrl: 'unverifiedurl.com'}.to_json
    refute project.valid?
  end

  test "project without thumbnail url is valid" do
    Project.any_instance.stubs(:channel_id).returns('xyz')
    project = build :project, value: {abc: 123}.to_json
    assert project.valid?
  end

  test "project with invalid json is valid" do
    Project.any_instance.stubs(:channel_id).returns('xyz')
    project = build :project, value: "{"
    assert project.valid?
  end
end
