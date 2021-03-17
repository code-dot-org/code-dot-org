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

  # Loads/merges the data from a CSV into the Standards table.
  # Can be used to overwrite the description and category of
  # existing Standards and to create new Standards.
  # Will not delete existing Standards.

  # @param filename [String] The path to the CSV file.
  # Expected columns:
  # - framework_id
  # - shortcode
  # - description
  # - organization (deprecated)
  # - organization_id (deprecated)
  # - concept (deprecated)
  def self.seed_from_csv(filename)
    created = 0
    updated = 0
    # The input file dashboard/config/standards.csv for the existing standards
    # seed task only contains csta standards. This entire method and that input
    # file will be removed before standards from any other frameworks can be
    # added to it, therefore it is safe to hardcode 'csta' here.
    framework = Framework.find_by!(shortcode: 'csta')
    categories = StandardCategory.where(framework: framework).all
    CSV.foreach(filename, {headers: true}) do |row|
      category = categories.find {|c| c.description == row['concept']}
      raise "category #{row['concept']} not found" unless category
      parsed = {
        framework: framework,
        category: category,
        shortcode: row['organization_id'],
        description: row['description'],
      }
      loaded = Standard.find_by({category: parsed[:category], shortcode: parsed[:shortcode]})
      if loaded.nil?
        begin
          Standard.new(parsed).save!
          created += 1
        rescue => error
          puts "Error when processing #{row}: #{error.message}"
        end
      else
        loaded.assign_attributes(parsed)
        if loaded.changed?
          loaded.update!(parsed)
          updated += 1
        end
      end
    end
    puts "Created #{created} standards, updated #{updated}"
  end

  def self.seed
    seed_from_csv("config/standards.csv")
  end
end
