require 'test_helper'

class LevelStarterAssetsControllerTest < ActionController::TestCase
  test 'show: returns summary of assets' do
    file_objs = [
      FakeS3ObjectSummary.new('starter_assets/1/ty.png', 123, 1.day.ago),
      FakeS3ObjectSummary.new('starter_assets/1/empty.png', 0, DateTime.now),
      FakeS3ObjectSummary.new('starter_assets/1/welcome.jpg', 321, 2.days.ago)
    ]
    LevelStarterAssetsController.any_instance.stubs(:get_file_objects).returns(file_objs)

    get :show, params: {id: 1}
    starter_assets = JSON.parse(response.body)['starter_assets']

    assert_equal 2, starter_assets.count
    assert_equal 'ty.png', starter_assets[0]['filename']
    assert_equal 'image', starter_assets[0]['category']
    assert_equal file_objs[0].size, starter_assets[0]['size']
    assert_equal 'welcome.jpg', starter_assets[1]['filename']
    assert_equal 'image', starter_assets[1]['category']
    assert_equal file_objs[2].size, starter_assets[1]['size']
  end
end

# Mock the Aws::S3::ObjectSummary class since we can't request the objects from S3 in tests:
# https://docs.aws.amazon.com/sdkforruby/api/Aws/S3/ObjectSummary.html
class FakeS3ObjectSummary
  attr_reader :key, :size, :last_modified

  def initialize(key, size, last_modified)
    @key = key
    @size = size
    @last_modified = last_modified
  end
end
