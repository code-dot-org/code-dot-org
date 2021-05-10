# == Schema Information
#
# Table name: standard_categories
#
#  id                 :bigint           not null, primary key
#  shortcode          :string(255)      not null
#  framework_id       :integer          not null
#  parent_category_id :integer
#  category_type      :string(255)      not null
#  properties         :text(65535)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_standard_categories_on_framework_id_and_shortcode  (framework_id,shortcode) UNIQUE
#  index_standard_categories_on_parent_category_id          (parent_category_id)
#
class StandardCategory < ApplicationRecord
  include SerializedProperties

  belongs_to :framework
  belongs_to :parent_category, class_name: 'StandardCategory'

  serialized_attrs %w(
    description
  )

  def self.seed_all
    Framework.all.each do |framework|
      filename = "config/standards/#{framework.shortcode}_categories.csv"
      CSV.foreach(filename, {headers: true}) do |row|
        category = StandardCategory.find_or_initialize_by(framework: framework, shortcode: row['category'])
        category.parent_category = StandardCategory.find_by!(shortcode: row['parent']) if row['parent']
        category.category_type = row['type']
        category.description = row['description']
        category.save! if category.changed?
      end
    end
  end
end
