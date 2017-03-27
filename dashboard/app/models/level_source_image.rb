# == Schema Information
#
# Table name: level_source_images
#
#  id              :integer          not null, primary key
#  level_source_id :integer
#  image           :binary(16777215)
#  created_at      :datetime
#  updated_at      :datetime
#
# Indexes
#
#  index_level_source_images_on_level_source_id  (level_source_id)
#

require 'cdo/aws/s3'
require 'image_lib'
require 'digest/md5'

# A bitmap image generated by a specific LevelSource
class LevelSourceImage < ActiveRecord::Base
  belongs_to :level_source

  def save_to_s3(image)
    return false if CDO.disable_s3_image_uploads
    return false if image.blank?

    begin
      image = ImageLib.to_png(image)
    rescue MiniMagick::Invalid, MiniMagick::Error # something wrong with the image or runtime error.
      return false
    end

    return false unless upload_original_image(image)

    if level_source.level.game.app == Game::ARTIST
      return false unless upload_framed_image(image)
    end

    save
  end

  S3_BUCKET = 'cdo-art'.freeze

  def upload_image(filename, image)
    AWS::S3.upload_to_bucket(S3_BUCKET, filename, image, no_random: true)
  end

  def upload_original_image(image)
    upload_image(s3_filename, image)
  end

  # Adds a frame to an image blob and uploads it to s3.
  # @param [String] image An image blob.
  def upload_framed_image(image)
    if level_source.level.try(:skin) == 'anna' || level_source.level.try(:skin) == 'elsa'
      frame_image_filename = "app/assets/images/blank_sharing_drawing_#{level_source.level.skin}.png"
    else
      frame_image_filename = "app/assets/images/blank_sharing_drawing.png"
    end

    begin
      framed_image = ImageLib.overlay_image(
        background_url: Rails.root.join(frame_image_filename),
        foreground_blob: image
      ).to_blob
    rescue MiniMagick::Invalid, MiniMagick::Error # something wrong with the image or runtime error.
      return false
    end

    upload_image(s3_framed_filename, framed_image)
  end

  def self.hashify_filename(plain)
    [Digest::MD5.hexdigest(plain), plain].join('=')
  end

  def s3_filename
    LevelSourceImage.hashify_filename "#{Rails.env}/#{level_source.id}.png"
  end

  def s3_framed_filename
    LevelSourceImage.hashify_filename "#{Rails.env}/#{level_source.id}_framed.png"
  end

  S3_URL = "https://d3p74s6bwmy6t9.cloudfront.net/".freeze

  def s3_url
    return "http://code.org/images/logo.png" if CDO.disable_s3_image_uploads
    S3_URL + s3_filename
  end

  def s3_framed_url
    return "http://code.org/images/logo.png" if CDO.disable_s3_image_uploads
    S3_URL + s3_framed_filename
  end
end
