require 'test_helper'

class LevelStarterAssetsControllerTest < ActionController::TestCase
  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns(true)

    # File must exist in order to use fixture_file_upload below.
    @filename = 'welcome.jpg'
    FileUtils.touch(@filename)

    # Mocks file object received from S3.
    @uuid_name = "#{SecureRandom.uuid}.png"
    @file_obj = MockS3ObjectSummary.new(@uuid_name, 123, 1.day.ago)
    # Mocks file sent to server for upload.
    @file = fixture_file_upload(@filename, 'image/jpg')
  end

  teardown do
    # Clean up file created in setup.
    File.delete(@filename)
  end

  test 'show: returns summary of assets' do
    uuid_name_1 = "#{SecureRandom.uuid}.png"
    key_1 = "starter_assets/#{uuid_name_1}"
    uuid_name_2 = "#{SecureRandom.uuid}.jpg"
    key_2 = "starter_assets/#{uuid_name_2}"
    file_objs = [
      MockS3ObjectSummary.new(key_1, 123, 1.day.ago),
      MockS3ObjectSummary.new(key_2, 321, 2.days.ago)
    ]
    LevelStarterAssetsController.any_instance.
      expects(:get_object).twice.
      returns(file_objs[0], file_objs[1])
    level_starter_assets = {
      'ty.png' => uuid_name_1,
      'welcome.jpg' => uuid_name_2
    }
    level = create(:applab, starter_assets: level_starter_assets)

    get :show, params: {level_name: level.name}
    starter_assets = JSON.parse(response.body)['starter_assets']

    assert_equal 2, starter_assets.count
    assert_equal 'ty.png', starter_assets[0]['filename']
    assert_equal 'image', starter_assets[0]['category']
    assert_equal file_objs[0].size, starter_assets[0]['size']
    assert_equal 'welcome.jpg', starter_assets[1]['filename']
    assert_equal 'image', starter_assets[1]['category']
    assert_equal file_objs[1].size, starter_assets[1]['size']
  end

  test 'file: returns requested file' do
    LevelStarterAssetsController.any_instance.
      expects(:get_object).
      with(@uuid_name).
      returns(@file_obj)
    LevelStarterAssetsController.any_instance.
      expects(:read_file).
      with(@file_obj).
      returns('hello, world!')
    level_starter_assets = {
      'ty.png' => @uuid_name
    }
    level = create(:applab, starter_assets: level_starter_assets)

    get :file, params: {level_name: level.name, filename: 'ty', format: 'png'}

    assert_equal 'hello, world!', response.body
    assert_equal 'image/png', response.headers['Content-Type']
    assert_equal 'inline', response.headers['Content-Disposition']
  end

  test 'upload: forbidden for non-levelbuilders' do
    sign_in create(:student)
    post :upload, params: {level_name: create(:applab).name, files: []}
    assert_response :forbidden
  end

  test 'upload: forbidden if not in levelbuilder_mode' do
    Rails.application.config.stubs(:levelbuilder_mode).returns(false)
    sign_in create(:levelbuilder)
    post :upload, params: {level_name: create(:applab).name, files: []}
    assert_response :forbidden
  end

  test 'upload: raises an error if 2+ files are uploaded' do
    sign_in create(:levelbuilder)

    e = assert_raises do
      post :upload, params: {level_name: create(:applab).name, files: ['file-1', 'file-2']}
    end
    assert_equal 'One file upload expected. Actual: 2', e.message
  end

  test 'upload: returns unprocessable_entity if file extension is invalid' do
    LevelStarterAssetsController.any_instance.expects(:get_object).never

    # File must exist in order to use fixture_file_upload.
    invalid_filename = 'invalid.exe'
    FileUtils.touch(invalid_filename)
    invalid_file = fixture_file_upload(invalid_filename, 'image/jpg')

    sign_in create(:levelbuilder)
    post :upload, params: {level_name: create(:applab).name, files: [invalid_file]}

    assert_response :unprocessable_entity

    # Clean up file.
    File.delete(invalid_filename)
  end

  test 'upload: returns unprocessable_entity if file fails to upload' do
    LevelStarterAssetsController.any_instance.
      expects(:get_object).
      returns(@file_obj)
    @file_obj.expects(:upload_file).returns(false)

    sign_in create(:levelbuilder)
    post :upload, params: {level_name: create(:applab).name, files: [@file]}

    assert_response :unprocessable_entity
  end

  test 'upload: raises if file uploads but starter asset is not added' do
    LevelStarterAssetsController.any_instance.
      expects(:get_object).
      returns(@file_obj)
    @file_obj.expects(:upload_file).returns(true)
    Level.any_instance.expects(:valid?).twice.returns(true, false)

    sign_in create(:levelbuilder)
    assert_raises ActiveRecord::RecordInvalid do
      post :upload, params: {level_name: create(:applab).name, files: [@file]}
    end
  end

  test 'upload: returns summary if file uploads and starter asset is added' do
    LevelStarterAssetsController.any_instance.
      expects(:get_object).
      returns(@file_obj)
    @file_obj.expects(:upload_file).returns(true)

    sign_in create(:levelbuilder)
    level = create :applab
    post :upload, params: {level_name: level.name, files: [@file]}

    level.reload
    assert_equal 1, level.starter_assets.length
    assert_response :success
    summary = JSON.parse(response.body)
    assert_equal @filename, summary['filename']
    assert_equal 'image', summary['category']
    assert_equal 123, summary['size']
  end

  test 'upload: can successfully upload files with single- and double- quotes in filenames' do
    LevelStarterAssetsController.any_instance.
      expects(:get_object).twice.
      returns(@file_obj)
    @file_obj.expects(:upload_file).twice.returns(true)
    sign_in create(:levelbuilder)
    level = create :applab

    single_quote_filename = "my-'file'.jpg"
    FileUtils.touch(single_quote_filename)
    single_quote_file = fixture_file_upload(single_quote_filename, 'image/jpg')
    post :upload, params: {level_name: level.name, files: [single_quote_file]}
    assert_response :success
    summary = JSON.parse(response.body)
    assert_equal single_quote_filename, summary['filename']
    File.delete(single_quote_filename)

    double_quote_filename = "\"my\"-file.png"
    FileUtils.touch(double_quote_filename)
    double_quote_file = fixture_file_upload(double_quote_filename, 'image/png')
    post :upload, params: {level_name: level.name, files: [double_quote_file]}
    assert_response :success
    summary = JSON.parse(response.body)
    assert_equal double_quote_filename, summary['filename']
    File.delete(double_quote_filename)
  end

  test 'destroy: forbidden for non-levelbuilders' do
    sign_in create(:student)
    delete :destroy, params: {level_name: create(:applab).name, filename: 'my-file.png'}

    assert_response :forbidden
  end

  test 'destroy: forbidden if not in levelbuilder_mode' do
    Rails.application.config.stubs(:levelbuilder_mode).returns(false)

    sign_in create(:levelbuilder)
    delete :destroy, params: {level_name: create(:applab).name, filename: 'my-file.png'}

    assert_response :forbidden
  end

  test 'destroy: returns no_content if starter asset successfully deleted' do
    level = create :applab, starter_assets: {'my-file.png' => '123-abc.png'}

    sign_in create(:levelbuilder)
    delete :destroy, params: {level_name: level.name, filename: 'my-file.png'}

    assert_response :no_content
  end

  test 'destroy: returns no_content if starter asset does not exist' do
    level = create :applab, starter_assets: {'my-file.png' => '123-abc.png'}

    sign_in create(:levelbuilder)
    delete :destroy, params: {level_name: level.name, filename: 'my-other-file.png'}

    assert_response :no_content
  end

  test 'destroy: raises if starter asset fails to be deleted' do
    Level.any_instance.expects(:valid?).returns(false)

    sign_in create(:levelbuilder)
    assert_raises ActiveRecord::RecordInvalid do
      delete :destroy, params: {level_name: create(:applab).name, filename: 'my-file.png'}
    end
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
