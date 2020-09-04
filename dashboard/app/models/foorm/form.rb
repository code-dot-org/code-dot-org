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
    filtered_submissions = submissions.
      reject {|submission| submission.workshop_metadata&.facilitator_specific?}

    # Default headers are the non-facilitator specific set of questions.
    headers = readable_questions[:general]

    comma_separated_submissions = []
    filtered_submissions.each do |submission|
      answers = submission.formatted_answers

      # Add in new headers for questions that are not in the form
      # but are in the submission (eg, survey config and workshop metadata).
      # Put new headers first, as they generally contain important general
      # information (eg, user_id, pd_workshop_id, etc.)
      potential_new_headers = Hash[
        answers.keys.map {|question_id| [question_id, question_id]}
      ]
      headers = potential_new_headers.merge headers

      if submission.associated_facilitator_submissions
        submission.associated_facilitator_submissions.each_with_index do |facilitator_response, index|
          next if facilitator_response.nil?
          facilitator_number = index + 1

          # Add facilitator number identifier to facilitator-specific questions
          facilitator_headers_with_facilitator_number = readable_questions_with_facilitator_number(facilitator_number)

          # Add same facilitator number identifier to facilitator-specific questions,
          # such that they map to the appropriate headers.
          facilitator_response_with_facilitator_number = facilitator_response.
            formatted_answers_with_facilitator_number(facilitator_number)

          # Add facilitator-specific response to answers,
          # and prep a new set of headers to add to cover facilitator-specific questions.
          # Don't add to headers array yet, as we want important information
          # in the response but not in the form itself (eg, facilitator ID)
          # to come before answers to facilitator-specific questions.
          facilitator_headers = facilitator_headers_with_facilitator_number
          answers.merge! facilitator_response_with_facilitator_number

          # Add any facilitator-specific questions as headers
          # that are in the submission but not already in the list of headers.
          potential_new_headers = Hash[
            facilitator_response_with_facilitator_number.keys.map {|question_id| [question_id, question_id]}
          ]
          facilitator_headers = potential_new_headers.merge facilitator_headers

          headers.merge! facilitator_headers
        end
      end

      # Keep a list of submissions separate from the CSV, so that we can iteratively
      # build the list of headers and add that as the first row.
      comma_separated_submissions << answers.values_at(*headers.keys)
    end

    rows_to_write = [headers.values]
    comma_separated_submissions.each {|row| rows_to_write << row}

    # Finally, add the header row and, subsequently, rows of survey responses.
    CSV.open(file_path, "wb") do |csv|
      rows_to_write.each {|row| csv << row}
    end

    rows_to_write
  end

  def parsed_questions
    Pd::Foorm::FoormParser.parse_forms([self])
  end

  # Returns a hash with keys matching what is produced by parsed_questions.
  # Each item is comprised of a question key, and a human readable question as its value.
  # It also flattens matrix questions into one entry per question.
  def readable_questions
    questions = {}

    # As of September 2020, the keys here are :general and :facilitator.
    parsed_questions.each do |questions_section, questions_content|
      questions[questions_section] = {}

      questions_content[key].each do |question_id, question_details|
        if question_details[:type] == 'matrix'
          matrix_questions = question_details[:rows]
          matrix_questions.each do |matrix_question_id, matrix_question_text|
            key = self.class.get_matrix_question_id(question_id, matrix_question_id)
            questions[questions_section][key] = question_details[:title] + ' >> ' + matrix_question_text
          end
        else
          questions[questions_section][question_id] = question_details[:title]
        end
      end
    end

    questions
  end

  def readable_questions_with_facilitator_number(number)
    Hash[
      readable_questions[:facilitator].map do |question_id, question_text|
        [question_id + "_#{number}", "Facilitator #{number}: " + question_text]
      end
    ]
  end
end
