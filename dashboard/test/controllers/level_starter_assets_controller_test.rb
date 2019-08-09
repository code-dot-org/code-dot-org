require 'test_helper'

class LevelStarterAssetsControllerTest < ActionController::TestCase
  test 'show: returns summary of assets' do
    file_objs = [
      MockS3ObjectSummary.new('starter_assets/1/ty.png', 123, 1.day.ago),
      MockS3ObjectSummary.new('starter_assets/1/empty.png', 0, DateTime.now),
      MockS3ObjectSummary.new('starter_assets/1/welcome.jpg', 321, 2.days.ago)
    ]
    LevelStarterAssetsController.any_instance.expects(:get_file_objects).returns(file_objs)

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

  test 'file: returns requested file' do
    file_obj = MockS3ObjectSummary.new('starter_assets/1/ty.png', 123, 1.day.ago)
    LevelStarterAssetsController.any_instance.
      expects(:get_file_object).
      with('starter_assets/1/ty.png').
      returns(file_obj)
    LevelStarterAssetsController.any_instance.
      expects(:read_file).
      with(file_obj).
      returns('hello, world!')

    get :file, params: {id: 1, filename: 'ty', format: 'png'}

    assert_equal 'hello, world!', response.body
    assert_equal 'image/png', response.headers['Content-Type']
    assert_equal 'inline', response.headers['Content-Disposition']
  end
end

# Mock Aws::S3::ObjectSummary class since we can't request the objects from S3 in tests:
# https://docs.aws.amazon.com/sdkforruby/api/Aws/S3/ObjectSummary.html
class MockS3ObjectSummary
  attr_reader :key, :size, :last_modified

  def initialize(key, size, last_modified)
    @key = key
    @size = size
    @last_modified = last_modified
  end
end
