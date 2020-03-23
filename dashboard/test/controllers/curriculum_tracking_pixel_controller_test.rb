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
    assert @firehose_record[:data_json]["locale"], "en-us"
    assert @firehose_record[:data_json]["csx"], "csf-18"
    assert @firehose_record[:data_json]["course_or_unit"], "pre-express"
    assert @firehose_record[:data_json]["lesson"], 11
  end

  def assert_non_english_curriculum_page_view_logged(curriculum_url, user_id)
    assert @firehose_record[:study], CurriculumTrackingPixelController::STUDY_NAME
    assert @firehose_record[:event], CurriculumTrackingPixelController::EVENT_NAME
    assert @firehose_record[:data_string], curriculum_url
    assert @firehose_record[:data_json]["locale"], "es-mx"
    assert @firehose_record[:data_json]["csx"], "csf-1718"
    assert @firehose_record[:data_json]["course_or_unit"], "coursec"
    assert @firehose_record[:data_json]["lesson"], 10
  end

  def refute_curriculum_page_view_logged
    assert_nil @firehose_record
  end

  setup do
    stub_firehose
    @teacher = create :teacher
    @example_curriculum_url = '/csf-18/pre-express/11/'
    @example_curriculum_url_with_locale = 'es-mx/csf-1718/coursec/10/'
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
