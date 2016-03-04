require 'test_helper'

class LevelSourceTest < ActiveSupport::TestCase

  setup do
    # rubocop:disable Lint/Void
    LevelSourceImage # make sure this is loaded before we mess around with mocking S3...
    # rubocop:enable Lint/Void
    CDO.disable_s3_image_uploads = true # make sure image uploads are disabled unless specified in individual tests

    @blank_image = File.read('test/fixtures/artist_image_blank.png', binmode: true)
    @good_image_png = File.read('test/fixtures/artist_image_1.png', binmode: true)
    @good_image_jpg = File.read('test/fixtures/playlab_image.jpg', binmode: true)
    @bad_image = "xjxgaiks"

    @level_source = create :level_source
  end

  test "save to s3" do
    expect_s3_upload

    level_source_image = LevelSourceImage.new(level_source_id: @level_source.id)
    assert level_source_image.save_to_s3(@good_image_png)
  end

  test "save to s3 for jpg" do
    expect_s3_upload

    level_source_image = LevelSourceImage.new(level_source_id: @level_source.id)
    assert level_source_image.save_to_s3(@good_image_jpg)
  end

  test "save to s3 twice for artist level image" do
    expect_s3_upload.twice # once for the original image, 2nd time for framed image

    artist_level = Artist.first
    level_source = create :level_source, level: artist_level
    level_source_image = LevelSourceImage.new(level_source_id: level_source.id)
    assert level_source_image.save_to_s3(@good_image_png)
  end

  test "save to s3 twice for jpg artist level image" do
    expect_s3_upload.twice # once for the original image, 2nd time for framed image

    artist_level = Artist.first
    level_source = create :level_source, level: artist_level
    level_source_image = LevelSourceImage.new(level_source_id: level_source.id)
    assert level_source_image.save_to_s3(@good_image_jpg)
  end

  test "don't save images to s3 for bad artist level image" do
    expect_no_s3_upload

    artist_level = Artist.first
    level_source = create :level_source, level: artist_level
    level_source_image = LevelSourceImage.new(level_source_id: level_source.id)
    assert !level_source_image.save_to_s3(@bad_image)
  end

  test "no save to s3 for empty string image" do
    expect_no_s3_upload

    level_source_image = LevelSourceImage.new(level_source_id: @level_source.id)
    assert !level_source_image.save_to_s3('')
  end

end
