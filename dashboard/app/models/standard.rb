# == Schema Information
#
# Table name: standards
#
#  id              :integer          not null, primary key
#  organization    :string(255)      not null
#  organization_id :string(255)      not null
#  description     :text(65535)
#  concept         :text(65535)
#  category_id     :bigint
#  framework_id    :integer
#  shortcode       :string(255)
#
# Indexes
#
#  index_standards_on_category_id                       (category_id)
#  index_standards_on_framework_id_and_shortcode        (framework_id,shortcode)
#  index_standards_on_organization_and_organization_id  (organization,organization_id) UNIQUE
#

class Standard < ApplicationRecord
  belongs_to :framework
  belongs_to :category, class_name: 'StandardCategory'
  has_and_belongs_to_many :lessons, association_foreign_key: 'stage_id'

  def summarize
    {
      id: id,
      organization: organization,
      organization_id: organization_id,
      description: description,
      concept: concept
    }
  end

  # Loads/merges the data from a CSV into the Standards table.
  # Can be used to overwrite the description and concept of
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

        # deprecated fields to stop using
        organization: row['organization'],
        organization_id: row['organization_id'],
        concept: row['concept'],
      }
      loaded = Standard.find_by({organization: parsed[:organization], organization_id: parsed[:organization_id]})
      if loaded.nil?
        begin
          Standard.new(parsed).save!
          created += 1
        rescue => error
          puts "Error when processing #{parsed[:organization]} #{parsed[:organization_id]}: #{error.message}"
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
