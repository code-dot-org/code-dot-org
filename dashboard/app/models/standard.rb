# == Schema Information
#
# Table name: standards
#
#  id           :integer          not null, primary key
#  description  :text(65535)
#  category_id  :bigint
#  framework_id :integer
#  shortcode    :string(255)
#
# Indexes
#
#  index_standards_on_category_id                 (category_id)
#  index_standards_on_framework_id_and_shortcode  (framework_id,shortcode)
#

class Standard < ApplicationRecord
  belongs_to :framework
  belongs_to :category, class_name: 'StandardCategory'
  has_and_belongs_to_many :lessons, association_foreign_key: 'stage_id'

  def summarize
    {
      id: id,
      shortcode: shortcode,
      category_description: category.description,
      description: description
    }
  end

  def summarize_for_lesson_show
    {
      framework_name: framework.name,
      category_shortcode: category&.shortcode,
      category_description: category&.description,
      shortcode: shortcode,
      description: description
    }
  end

  # Loads/merges the data from a CSV into the Standards table.
  # Can be used to overwrite the description and category of
  # existing Standards and to create new Standards.
  # Will not delete existing Standards.
  def self.seed_all
    Framework.all.each do |framework|
      filename = "config/standards/#{framework.shortcode}_standards.csv"
      CSV.foreach(filename, {headers: true}) do |row|
        standard = Standard.find_or_initialize_by(framework: framework, shortcode: row['standard'])
        standard.category = StandardCategory.find_by!(framework: framework, shortcode: row['category'])
        standard.description = row['description']
        standard.save! if standard.changed?
      end
    end
  end
end
