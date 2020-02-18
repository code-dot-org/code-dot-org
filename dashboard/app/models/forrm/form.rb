# == Schema Information
#
# Table name: forrm_forms
#
#  id         :integer          not null, primary key
#  name       :string(255)      not null
#  version    :integer          not null
#  questions  :text(65535)      not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_forrm_forms_on_name_and_version  (name,version) UNIQUE
#

class Forrm::Form < ActiveRecord::Base
  include Seeded

  has_many :forrm_submissions

  def self.setup
    forrms = Dir.glob('config/forrms/**/*.json').sort.map.with_index(1) do |path, id|
      # Given: "config/forrms/surveys/pd/pre_workshop_survey.0.json"
      # we get full_name: "surveys/pd/pre_workshop_survey"
      #      and version: 0
      unique_path = path.partition("config/forrms/")[2]
      filename_and_version = File.basename(unique_path, ".json")
      filename, version = filename_and_version.split(".")
      version = version.to_i
      full_name = File.dirname(unique_path) + "/" + filename

      # Let's load the JSON text.
      questions = File.read(path)

      {
        id: id,
        name: full_name,
        version: version,
        questions: questions
      }
    end

    transaction do
      reset_db
      Forrm::Form.import! forrms
    end
  end
end
