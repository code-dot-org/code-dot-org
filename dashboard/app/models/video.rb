# Links to a YouTube video
class Video < ActiveRecord::Base
  include Seeded

  def self.find_by_key(key)
    return nil if key.nil?
    Rails.cache.fetch('find_by_key') do
      Video.all.index_by(&:key)
    end[:key] || find_by(key: key)
  end
end
