# == Schema Information
#
# Table name: videos
#
#  id           :integer          not null, primary key
#  key          :string(255)
#  youtube_code :string(255)
#  created_at   :datetime
#  updated_at   :datetime
#  download     :string(255)
#

# Links to a YouTube video
class Video < ActiveRecord::Base
  include Seeded

  # YouTube video IDs must be 11 characters and contain no invalid characters, such as exclamation points or asterisks.
  # Ref: https://developers.google.com/youtube/iframe_api_reference (events|onError|2)
  YOUTUBE_ID_REGEX = /[^!*"&?\/ ]{11}/
  # YouTube embed URL has the following format: http://www.youtube.com/embed/VIDEO_ID
  # Ref: https://developers.google.com/youtube/player_parameters#Manual_IFrame_Embeds
  EMBED_URL_REGEX = /(?:http[s]?:)?\/\/(?:www\.)?(?:youtube(?:education)?)\.com\/embed\/(?<id>#{YOUTUBE_ID_REGEX})/

  def self.check_i18n_names
    video_keys = Video.all.collect(&:key)
    i18n_keys = I18n.t('data.video.name').keys.collect(&:to_s)

    missing_keys = video_keys - i18n_keys
    unless missing_keys.empty?
      raise "Missing strings for video.name.#{missing_keys} in config/locales/data.en.yml, please add"
    end
  end

  def self.setup
    transaction do
      reset_db
      CSV.read('config/videos.csv', { col_sep: "\t", headers: true }).each_with_index do |row, id|
        create!(id: id + 1, key: row['Key'], youtube_code: row['YoutubeCode'], download: row['Download'])
      end
    end
    check_i18n_names
  end

  def self.youtube_base_url
    'https://www.youtube.com'
  end

  def youtube_url(args={})
    defaults = {
        v: youtube_code,
        modestbranding: 1,
        rel: 0,
        showinfo: 1,
        autoplay: 1,
        wmode: 'transparent',
        iv_load_policy: 3,
        enablejsapi: 1
    }

    language = I18n.locale.to_s.downcase.split('-').first
    if language != 'en'
      defaults[:cc_lang_pref] = language
      defaults[:cc_load_policy] = 1
    end
    defaults.merge!(args)
    "#{Video.youtube_base_url}/embed/#{youtube_code}/?#{defaults.to_query}"
  end

  def self.embed_url(id)
    CDO.studio_url "videos/embed/#{id}"
  end

  def self.download_url(key)
    "#{CDO.videos_url}/youtube/#{key}.mp4"
  end

  def thumbnail_url
    "#{CDO.videos_url}/youtube/#{key}.jpg"
  end

  def thumbnail_path
    if id
      path = "/c/video_thumbnails/#{id}.jpg"
      return path if File.exist? dashboard_dir('public', path)
    end
    self.thumbnail_url
  end

  def summarize(autoplay = true)
    # Note: similar video info is also set in javascript at levels/_blockly.html.haml
    {
        src: youtube_url(autoplay: autoplay ? 1 : 0),
        key: key,
        name: I18n.t("data.video.name.#{key}"),
        download: download,
        thumbnail: thumbnail_path,
        enable_fallback: true,
        autoplay: autoplay
    }
  end
end
