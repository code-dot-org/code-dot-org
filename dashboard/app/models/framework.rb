# == Schema Information
#
# Table name: frameworks
#
#  id         :bigint           not null, primary key
#  shortcode  :string(255)      not null
#  name       :string(255)      not null
#  properties :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_frameworks_on_shortcode  (shortcode) UNIQUE
#
class Framework < ApplicationRecord
  def summarize_for_lesson_edit
    {
      name: name,
      shortcode: shortcode
    }
  end

  def self.seed_all
    filename = 'config/standards/frameworks.csv'
    CSV.foreach(filename, {headers: true}) do |row|
      framework = Framework.find_or_initialize_by(shortcode: row['framework'])
      framework.name = row['name']
      framework.save! if framework.changed?
    end
  end
end
