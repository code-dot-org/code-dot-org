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

  # maybe this should be after update?
  # but we want it to run on creation of a new question in the editor
  # will be circular if coming from file?
  # i like form pattern to keep everything in "questions" as what came from file
  #after_save :write_library_to_file

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

  def other_questions_in_library
    Foorm::LibraryQuestion.where(
      library_name: library_name,
      library_version: library_version
    ).
    where.not(id: id)
  end

  def library_formatted
    # figure out which of these is necessary for valid SurveyJS
    {}.tap do |library|
      library['published'] = true
      library['pages'] = [Hash.new]
      library['pages'].first['elements'] = [].tap do |elements|
        elements << JSON.parse(question)
        other_questions_in_library.each do |library_question|
          elements << JSON.parse(library_question.question)
        end
      end
    end
  end

  def validate_library_question
    Foorm::Form.validate_element(JSON.parse(question).deep_symbolize_keys, Set.new)
  rescue StandardError => e
    errors.add(:question, e.message)
  end

  def write_library_to_file
    if write_to_file? && saved_changes?
      file_path = Rails.root.join("config/foorm/library/#{library_name}.#{library_version}.json")
      file_directory = File.dirname(filepath)
      unless Dir.exist?(file_directory)
        FileUtils.mkdir_p(file_directory)
      end
      File.write(file_path, library_formatted_as_json)
    end
  end

  def write_to_file?
    Rails.application.config.levelbuilder_mode
  end
end
