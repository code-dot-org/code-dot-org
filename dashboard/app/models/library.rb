# == Schema Information
#
# Table name: libraries
#
#  id         :integer          not null, primary key
#  name       :string(255)      not null
#  content    :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Library < ApplicationRecord
  include MultiFileSeeded
  CONFIG_DIRECTORY = 'libraries'
  SUBDIRECTORY_ATTRIBUTES = []
  EXTENSION = 'interpreted.js'

  def file_content
    content
  end

  def self.properties_from_file(path, content)
    {
      name: File.basename(path, ".#{EXTENSION}"),
      content: content,
    }
  end

  def self.content_from_cache(name)
    if Script.should_cache?
      @@all_library_names ||= Library.distinct.pluck(:name)
      return nil unless @@all_library_names.include? name
    end

    Rails.cache.fetch("libraries/#{name}", force: !Script.should_cache?) do
      Library.find_by(name: name).try(:content)
    end
  end
end
