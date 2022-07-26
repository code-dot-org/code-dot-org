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
#  locale       :string(255)      default("en-US"), not null
#
# Indexes
#
#  index_videos_on_key_and_locale  (key,locale) UNIQUE
#

# Links to a YouTube video
class Video < ApplicationRecord
  include Seeded

  default_scope {order(:key)}
  scope :english_locale, -> {where(locale: 'en-US')}
  # This SQL string is not at risk for injection vulnerabilites because it's
  # just a hardcoded string, so it's safe to wrap in Arel.sql
  scope :current_locale, -> {where(locale: I18n.locale.to_s).or(Video.english_locale).unscope(:order).order(Arel.sql("(case when locale = 'en-US' then 0 else 1 end) desc"))}

  validates_uniqueness_of :key, scope: [:locale], case_sensitive: true
  validates :key, format: {with: /\A[a-zA-Z0-9\-_]+\z/}
  validates_presence_of :download

  before_save :fetch_thumbnail

  # YouTube video IDs must be 11 characters and contain no invalid characters, such as exclamation points or asterisks.
  # Ref: https://developers.google.com/youtube/iframe_api_reference (events|onError|2)
  YOUTUBE_ID_REGEX = /[^!*"&?\/ ]{11}/
  # YouTube embed URL has the following format: http://www.youtube-nocookie.com/embed/VIDEO_ID
  # Ref: https://developers.google.com/youtube/player_parameters#Manual_IFrame_Embeds
  EMBED_URL_REGEX = /(?:http[s]?:)?\/\/(?:www\.)?(?:youtube(?:education|-nocookie)?)\.com\/embed\/(?<id>#{YOUTUBE_ID_REGEX})/

  def self.check_i18n_names
    video_keys = Video.all.collect(&:key)
    missing_keys = video_keys.reject {|key| I18n.t("data.video.name.#{key}", default: nil)}
    unless missing_keys.empty?
      raise "Missing strings for video.name.#{missing_keys} in config/locales/data.en.yml, please add"
    end
  end

  def self.setup
    videos = CSV.read('config/videos.csv', headers: true).map.with_index(1) do |row, id|
      {id: id, key: row['Key'], youtube_code: row['YoutubeCode'], download: row['Download'], locale: row['Locale']}
    end
    transaction do
      reset_db
      Video.import! videos
    end
    check_i18n_names
  end

  def self.merge_and_write_i18n(videos_i18n)
    data_yml = File.expand_path('config/locales/data.en.yml')
    i18n = File.exist?(data_yml) ? YAML.load_file(data_yml) : {}

    updated_i18n = i18n.deep_merge({'en' => {'data' => {'video' => {'name' => videos_i18n}}}})
    File.write(data_yml, "# Autogenerated locale file.\n" + updated_i18n.to_yaml(line_width: -1))
  end

  def self.merge_and_write_attributes(key, youtube_code, download, locale, videos_csv_path='config/videos.csv')
    csv_path = File.expand_path(videos_csv_path)
    data = CSV.read(csv_path, headers: true)

    row = data.find {|r| r['Key'] == key && r['Locale'] == locale}
    if row
      row['YoutubeCode'] = youtube_code
      row['Download'] = download
    else
      data << [key, nil, nil, youtube_code, download, locale]
    end

    File.write(csv_path, data.to_csv)
  end

  def self.youtube_base_url
    'https://www.youtube-nocookie.com'
  end

  def self.s3_metadata(url)
    key = url.sub(/^https?:\/\/videos.code.org\//, '')
    AWS::S3.create_client.head_object(bucket: 'videos.code.org', key: key)
  rescue Aws::S3::Errors::NoSuchKey
    {}
  end

  def fetch_thumbnail
    return unless Rails.application.config.levelbuilder_mode
    return unless locale == I18n.default_locale.to_s

    path = dashboard_dir('public', 'c', 'video_thumbnails', "#{key}.jpg")
    url = "http://img.youtube.com/vi/#{youtube_code}/mqdefault.jpg"
    IO.copy_stream(URI.parse(url).open, path)
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

  def embed_url
    Video.embed_url youtube_code
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
      path = "/c/video_thumbnails/#{key}.jpg"
      return path if File.exist? dashboard_dir('public', path)
    end
    thumbnail_url
  end

  def localized_name
    I18n.t("data.video.name.#{key}")
  end

  def summarize(autoplay = true)
    # Note: similar video info is also set in javascript at levels/_blockly.html.haml
    {
      src: youtube_url(autoplay: autoplay ? 1 : 0),
      key: key,
      name: localized_name,
      download: download,
      thumbnail: thumbnail_path,
      enable_fallback: true,
      autoplay: autoplay,
    }
  end
end
