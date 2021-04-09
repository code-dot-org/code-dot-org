# == Schema Information
#
# Table name: foorm_libraries
#
#  id         :bigint           not null, primary key
#  name       :string(255)      not null
#  version    :integer          not null
#  published  :boolean          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_foorm_libraries_on_multiple_fields  (name,version) UNIQUE
#
class Foorm::Library < ApplicationRecord
  include Seeded

  # To consider: should a Foorm::Library go through all of the same validations as a Foorm::Form?
  has_many :library_questions, primary_key: [:name, :version], foreign_key: [:library_name, :library_version]
  validates :name, :version, presence: true

  after_commit :write_library_to_file

  def self.setup
    # Seed all libraries inside of a transaction, such that all libraries are imported/updated successfully
    # or none at all.
    ActiveRecord::Base.transaction do
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
        library = Foorm::Library.find_or_initialize_by(
          name: full_name,
          version: version
        )

        source_questions = JSON.parse(File.read(path))
        # if published is not provided, default to true
        published = source_questions['published'].nil? ? true : source_questions['published']

        library.published = published
        library.save! if library.changed?

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
      rescue JSON::ParserError
        raise format('failed to parse %s', full_name)
      end
    end
  end

  def formatted_for_file
    elements = library_questions.map {|library_question| JSON.parse(library_question.question)}

    JSON.pretty_generate(
      {
        'published' => published,
        'pages' => [
          {'elements' => elements}
        ]
      }
    )
  end

  def write_library_to_file
    if write_to_file?
      file_path = Rails.root.join("config/foorm/library/#{name}.#{version}.json")
      file_directory = File.dirname(file_path)
      unless Dir.exist?(file_directory)
        FileUtils.mkdir_p(file_directory)
      end
      File.write(file_path, formatted_for_file)
    end
  end

  def write_to_file?
    Rails.application.config.levelbuilder_mode
  end
end
