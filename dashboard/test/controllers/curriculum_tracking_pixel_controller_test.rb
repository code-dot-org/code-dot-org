require 'test_helper'

class CurriculumTrackingPixelControllerTest < ActionController::TestCase
  def stub_firehose
    FirehoseClient.instance.stubs(:put_record).with do |stream, args|
      @firehose_record = args
      @firehose_stream = stream
      true
    end
  end

  def teardown
    @firehose_record = nil
    @firehose_stream = nil
  end

  def assert_curriculum_page_view_logged(curriculum_url, user_id)
    assert_equal @firehose_record[:study], CurriculumTrackingPixelController::STUDY_NAME
    assert_equal @firehose_record[:event], CurriculumTrackingPixelController::EVENT_NAME
    assert_equal @firehose_record[:data_string], curriculum_url
    parsed_result = JSON.parse(@firehose_record[:data_json])
    assert parsed_result['locale'], "en-us"
    assert_equal parsed_result['csx'], "csf-18"
    assert_equal parsed_result['course_or_unit'], "pre-express"
    assert_equal parsed_result['lesson'], "11"
    assert_equal :analysis, @firehose_stream
  end

  def assert_non_english_curriculum_page_view_logged(curriculum_url, user_id)
    assert_equal @firehose_record[:study], CurriculumTrackingPixelController::STUDY_NAME
    assert_equal @firehose_record[:event], CurriculumTrackingPixelController::EVENT_NAME
    assert_equal @firehose_record[:data_string], curriculum_url
    parsed_result = JSON.parse(@firehose_record[:data_json])
    assert parsed_result['locale'], "es-mx"
    assert_equal parsed_result['csx'], "csf-1718"
    assert_equal parsed_result['course_or_unit'], "coursec"
    assert_equal parsed_result['lesson'], "10"
    assert_equal :analysis, @firehose_stream
  end

  def refute_curriculum_page_view_logged
    assert_nil @firehose_record
  end

  setup do
    stub_firehose
    @teacher = create :teacher
    @example_curriculum_url = '/csf-18/pre-express/11/'
    @example_curriculum_url_with_locale = '/es-mx/csf-1718/coursec/10/'
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

  test "get index for signed out, non-English curriculum_url" do
    get :index, params: {from: @example_curriculum_url_with_locale}
    assert_response :success
    assert_non_english_curriculum_page_view_logged(@example_curriculum_url_with_locale, nil)
  end

  test "get index for signed in, no curriculum_url" do
    sign_in @teacher
    get :index
    assert_response :success
    refute_curriculum_page_view_logged
  end

  test "get index for signed in, non-English curriculum_url" do
    sign_in @teacher
    get :index, params: {from: @example_curriculum_url_with_locale}
    assert_response :success
    assert_non_english_curriculum_page_view_logged(@example_curriculum_url_with_locale, @teacher.id)
  end

  test "get index for signed in, curriculum_url" do
    sign_in @teacher
    get :index, params: {from: @example_curriculum_url}
    assert_response :success
    assert_curriculum_page_view_logged(@example_curriculum_url, @teacher.id)
  end
end
