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
#  index_standards_on_description                 (description)
#  index_standards_on_framework_id_and_shortcode  (framework_id,shortcode)
#

class Standard < ApplicationRecord
  belongs_to :framework, optional: true
  belongs_to :category, class_name: 'StandardCategory', optional: true
  has_one :parent_category, through: :category

  # ensures associated lessons_standards are deleted when a standard is deleted
  has_and_belongs_to_many :lessons, association_foreign_key: 'stage_id'

  # ensures associated lessons_opportunity_standards are deleted when a standard
  # is deleted
  has_many :lessons_opportunity_standards, dependent: :destroy

  def summarize
    {
      id: id,
      shortcode: shortcode,
      category_description: category.localized_description,
      description: localized_description
    }
  end

  def summarize_for_lesson_show
    {
      frameworkName: framework.localized_name,
      parentCategoryShortcode: parent_category&.shortcode,
      parentCategoryDescription: parent_category&.localized_description,
      categoryShortcode: category&.shortcode,
      categoryDescription: category&.localized_description,
      shortcode: shortcode,
      description: localized_description
    }
  end

  def summarize_for_lesson_edit
    {
      frameworkShortcode: framework.shortcode,
      frameworkName: framework.name,
      parentCategoryShortcode: parent_category&.shortcode,
      parentCategoryDescription: parent_category&.description,
      categoryShortcode: category&.shortcode,
      categoryDescription: category&.description,
      shortcode: shortcode,
      description: description
    }
  end

  def crowdin_key
    [framework.shortcode, shortcode].join('/')
  end

  def localized_description
    Services::I18n::CurriculumSyncUtils.get_localized_property(self, :description, crowdin_key)
  end

  # Loads/merges the data from a CSV into the Standards table.
  # Can be used to overwrite the description and category of
  # existing Standards and to create new Standards.
  # Will not delete existing Standards.
  def self.seed_all
    Framework.all.each do |framework|
      filename = "config/standards/#{framework.shortcode}_standards.csv"
      CSV.foreach(filename, headers: true) do |row|
        standard = Standard.find_or_initialize_by(framework: framework, shortcode: row['standard'])
        standard.category = StandardCategory.find_by!(framework: framework, shortcode: row['category'])
        standard.description = row['description']
        standard.save! if standard.changed?
      end
    end
  end
end
