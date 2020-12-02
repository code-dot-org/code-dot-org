# == Schema Information
#
# Table name: standards
#
#  id              :integer          not null, primary key
#  organization    :string(255)      not null
#  organization_id :string(255)      not null
#  description     :text(65535)
#  concept         :text(65535)
#
# Indexes
#
#  index_standards_on_organization_and_organization_id  (organization,organization_id) UNIQUE
#

class Standard < ApplicationRecord
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
  # - organization
  # - organization_id
  # - description
  # - concept
  def self.seed_from_csv(filename)
    created = 0
    updated = 0
    CSV.foreach(filename, {headers: true}) do |row|
      parsed = {
        organization: row['organization'],
        organization_id: row['organization_id'],
        description: row['description'],
        concept: row['concept']
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
