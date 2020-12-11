# == Schema Information
#
# Table name: foorm_library_questions
#
#  id              :integer          not null, primary key
#  library_name    :string(255)      not null
#  library_version :integer          not null
#  question_name   :string(255)      not null
#  question        :text(65535)      not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  published       :boolean          default(TRUE), not null
#
# Indexes
#
#  index_foorm_library_questions_on_multiple_fields  (library_name,library_version,question_name) UNIQUE
#

class Foorm::LibraryQuestion < ApplicationRecord
  include Seeded

  validate :validate_library_question

  def self.setup
    Dir.glob('config/foorm/library/**/*.json').each do |path|
      # Given: "config/foorm/library/surveys/pd/pre_workshop_survey.0.json"
      # we get full_name: "surveys/pd/pre_workshop_survey"
      #      and version: 0
      unique_path = path.partition("config/foorm/library/")[2]
      filename_and_version = File.basename(unique_path, ".json")
      filename, version = filename_and_version.split(".")
      version = version.to_i
      full_name = File.dirname(unique_path) + "/" + filename

      # Let's load the JSON text.
      begin
        source_questions = JSON.parse(File.read(path))
        # if published is not provided, default to true
        published = source_questions['published'].nil? ? true : source_questions['published']

        source_questions["pages"].map do |page|
          page["elements"].map do |element|
            question_name = element["name"]
            library_question = Foorm::LibraryQuestion.find_or_initialize_by(
              library_name: full_name,
              library_version: version,
              question_name: question_name
            )
            library_question.question = element.to_json
            library_question.published = published
            library_question.save! if library_question.changed?
          end
        end
      rescue
        raise format('failed to parse %s', full_name)
      end
    end
  end

  def validate_library_question
    Foorm::Form.validate_element(JSON.parse(question).deep_symbolize_keys, Set.new)
  rescue StandardError => e
    errors.add(:question, e.message)
  end
end
