require 'test_helper'

class LevelSourceTest < ActiveSupport::TestCase

  setup do
    LevelSourceImage # make sure this is loaded before we mess around with mocking S3...
    CDO.disable_s3_image_uploads = true # make sure image uploads are disabled unless specified in individual tests

    @blank_image = File.read('test/fixtures/artist_image_blank.png', binmode: true)
    @good_image = File.read('test/fixtures/artist_image_1.png', binmode: true)
    @bad_image = "xjxgaiks"

    @level_source = create :level_source
  end

  test "save to s3" do
    expect_s3_upload

    level_source_image = LevelSourceImage.new(level_source_id: @level_source.id)
    level_source_image.save_to_s3(@good_image)
  end

  test "no save to s3 for bad image" do
    expect_no_s3_upload

    level_source_image = LevelSourceImage.new(level_source_id: @level_source.id)
    level_source_image.save_to_s3(@bad_image)
  end


  test "no save to s3 for empty string image" do
    expect_no_s3_upload

    level_source_image = LevelSourceImage.new(level_source_id: @level_source.id)
    level_source_image.save_to_s3('')
  end

end
