# == Schema Information
#
# Table name: libraries
#
#  id      :integer          not null, primary key
#  name    :string(255)      not null
#  content :text(16777215)
#
# Indexes
#
#  index_libraries_on_name  (name)
#

class Library < ApplicationRecord
  include MultiFileSeeded
  CONFIG_DIRECTORY = 'libraries'
  SUBDIRECTORY_ATTRIBUTES = []
  EXTENSION = 'interpreted.js'

  after_save {@@all_library_names = nil}

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
    @@all_library_names ||= Library.distinct.pluck(:name)
    return nil unless @@all_library_names.include? name

    Rails.cache.fetch("libraries/#{name}", force: !Script.should_cache?) do
      Library.find_by(name: name).content
    end
  end
end
