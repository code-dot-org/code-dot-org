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
