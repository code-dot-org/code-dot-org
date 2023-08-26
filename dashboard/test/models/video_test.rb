require 'test_helper'

class VideoTest < ActiveSupport::TestCase
  setup do
    Video.stubs(:merge_and_write_i18n)
    Video.stubs(:merge_and_write_attributes)
    Video.stubs(:s3_metadata).returns({})
    Video.any_instance.stubs(:fetch_thumbnail)
    VideosController.any_instance.stubs(:upload_to_s3).returns('_fake_s3_url_')
  end

  test "cannot create a video key with a name that contains a colon(s)" do
    video = Video.new(key: 'Tech:Hub sea:tac', download: 'no_download_link')
    refute video.valid?
    assert_includes(video.errors, :key)
  end

  test "check_i18n_names" do
    # does not raise exception ..
    Video.check_i18n_names

    Video.create!(key: 'no_i18n_yet', download: 'no_download_link')

    # .. until we create a video without adding its name to the i18n file
    assert_raises(RuntimeError) do
      Video.check_i18n_names
    end
  end

  test "non-EN video is chosen when it exists" do
    Video.create(key: 'multi_lang_video', youtube_code: '_fake_code_', download: 'my-download-link.com')
    Video.create(key: 'multi_lang_video', youtube_code: '_fake_code_es_', download: 'my-download-link-es.com', locale: 'es-MX')
    with_locale('es-MX') do
      es_video = Video.current_locale.find_by_key('multi_lang_video')
      assert_not_nil es_video
      assert_equal 'es-MX', es_video.locale
    end
  end

  test "EN video is chosen when non-EN video doesn't exist" do
    Video.create(key: 'multi_lang_video', youtube_code: '_fake_code_', download: 'my-download-link.com')
    Video.create(key: 'multi_lang_video', youtube_code: '_fake_code_es_', download: 'my-download-link-es.com', locale: 'es-MX')
    with_locale('nl-NL') do
      en_video = Video.current_locale.find_by_key('multi_lang_video')
      assert_not_nil en_video
      assert_equal 'en-US', en_video.locale
    end
  end
end
