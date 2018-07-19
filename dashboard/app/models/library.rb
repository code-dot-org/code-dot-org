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
  EXTENSION = 'js'

  def file_content
    content
  end

  def self.properties_from_file(path, content)
    {
      name: File.basename(path, ".#{EXTENSION}"),
      content: content,
    }
  end
end
