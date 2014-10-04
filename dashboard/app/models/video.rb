# Links to a YouTube video
class Video < ActiveRecord::Base
  include Seeded

  def self.check_i18n_names
    video_keys = Video.all.collect(&:key)
    i18n_keys = I18n.t('data.video.name').keys.collect(&:to_s)

    missing_keys = video_keys - i18n_keys
    unless missing_keys.empty?
      raise "Missing strings for video.name.#{missing_keys.to_s} in config/locales/data.en.yml, please add"
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

  def self.find_by_key(key)
    return nil if key.nil?
    Rails.cache.fetch('find_by_key') do
      Video.all.index_by(&:key)
    end[:key] || find_by(key: key)
  end
end
