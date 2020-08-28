# == Schema Information
#
# Table name: foorm_forms
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
#  index_foorm_forms_on_name_and_version  (name,version) UNIQUE
#

class Foorm::Form < ActiveRecord::Base
  include Seeded

  has_many :submissions, foreign_key: [:form_name, :form_version], primary_key: [:name, :version]

  # We have a uniqueness constraint on form name and version for this table.
  # This key format is used elsewhere in Foorm to uniquely identify a form.
  def key
    "#{name}.#{version}"
  end

  def self.setup
    forms = Dir.glob('config/foorm/forms/**/*.json').sort.map.with_index(1) do |path, id|
      # Given: "config/foorm/forms/surveys/pd/pre_workshop_survey.0.json"
      # we get full_name: "surveys/pd/pre_workshop_survey"
      #      and version: 0
      unique_path = path.partition("config/foorm/forms/")[2]
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
      Foorm::Form.import! forms
    end
  end

  def self.get_questions_and_latest_version_for_name(form_name)
    latest_version = Foorm::Form.where(name: form_name).maximum(:version)
    return nil if latest_version.nil?

    questions = get_questions_for_name_and_version(form_name, latest_version)

    return questions, latest_version
  end

  def self.get_questions_for_name_and_version(form_name, form_version)
    form = Foorm::Form.where(name: form_name, version: form_version).first

    # Substitute any questions from the library.
    questions = JSON.parse(form.questions)
    questions = fill_in_library_items(questions)

    return questions
  end

  def self.fill_in_library_items(questions)
    questions["pages"]&.each do |page|
      page["elements"]&.map! do |element|
        if element["type"] == "library_item"
          JSON.parse(
            Foorm::LibraryQuestion.where(
              library_name: element["library_name"],
              library_version: element["library_version"].to_i,
              question_name: element["name"]
            ).first.question
          )
        else
          element
        end
      end
    end
    return questions
  end

  def self.get_matrix_question_id(parent_question_id, sub_question_id)
    parent_question_id + '-' + sub_question_id
  end

  # For a given Form, this method will produce a CSV of all responses
  # received for that Form. It includes the content of the form submitted
  # by a user, as well as some additional metadata about the context
  # in which the form was submitted (eg, workshop ID, user ID).
  def submissions_to_csv(file_path)
    formatted_submissions = []

    submissions.each do |submission|
      formatted_submission = submission.formatted_answers
      formatted_submission.concat submission.formatted_metadata

      formatted_submissions << formatted_submission
    end

    CSV.open(file_path, "wb") do |csv|
      break if formatted_submissions.empty?

      csv << formatted_submissions.first.map {|question_answer_pair| question_answer_pair[:question]}
      formatted_submissions.each do |submission|
        csv << submission.map {|question_answer_pair| question_answer_pair[:answer]}
      end
    end
  end

  def readable_questions
    questions = {}

    parsed_questions[:general][key].each do |question_id, question_details|
      if question_details[:type] == 'matrix'
        matrix_questions = question_details[:rows]
        matrix_questions.each do |matrix_question_id, matrix_question_text|
          key = self.class.get_matrix_question_id(question_id, matrix_question_id)
          questions[key] = question_details[:title] + ' >> ' + matrix_question_text
        end
      else
        questions[question_id] = question_details[:title]
      end
    end

    questions
  end

  def parsed_questions
    Pd::Foorm::FoormParser.parse_forms([self])
  end
end
