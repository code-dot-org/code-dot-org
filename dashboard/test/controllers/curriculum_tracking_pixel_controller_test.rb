require 'test_helper'

class CurriculumTrackingPixelControllerTest < ActionController::TestCase
  def stub_firehose
    FirehoseClient.instance.stubs(:put_record).with do |args|
      @firehose_record = args
      true
    end
  end

  def assert_curriculum_page_view_logged(curriculum_url, user_id)
    assert @firehose_record[:study], CurriculumTrackingPixelController::STUDY_NAME
    assert @firehose_record[:event], CurriculumTrackingPixelController::EVENT_NAME
    assert @firehose_record[:data_string], curriculum_url
    split_url = curriculum_url.try(:split, '/')
    assert @firehose_record[:data_json]["csx"], split_url[1]
    assert @firehose_record[:data_json]["course_or_unit"], split_url[2]
    assert @firehose_record[:data_json]["lesson"], split_url[3]
  end

  def refute_curriculum_page_view_logged
    assert_nil @firehose_record
  end

  setup do
    stub_firehose
    @teacher = create :teacher
    @example_curriculum_url = '/csf-18/pre-express/11/'
  end

  test "get index for signed out, no curriculum_url" do
    get :index
    assert_response :success
    refute_curriculum_page_view_logged
  end

  test "get index for signed out, curriculum_url" do
    get :index, params: {from: @example_curriculum_url}
    assert_response :success
    assert_curriculum_page_view_logged(@example_curriculum_url, nil)
  end

  test "get index for signed in, no curriculum_url" do
    sign_in @teacher
    get :index
    assert_response :success
    refute_curriculum_page_view_logged
  end

  test "get index for signed in, curriculum_url" do
    sign_in @teacher
    get :index, params: {from: @example_curriculum_url}
    assert_response :success
    assert_curriculum_page_view_logged(@example_curriculum_url, @teacher.id)
  end
end
