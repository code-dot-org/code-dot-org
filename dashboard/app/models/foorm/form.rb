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
  include Pd::Foorm::Constants

  class InvalidFoormConfigurationError < StandardError; end

  has_many :submissions, foreign_key: [:form_name, :form_version], primary_key: [:name, :version]
  validate :validate_questions

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
      Foorm::Form.delete_all
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
          library_question = Foorm::LibraryQuestion.where(
            library_name: element["library_name"],
            library_version: element["library_version"].to_i,
            question_name: element["name"]
          ).first
          unless library_question
            raise InvalidFoormConfigurationError, "cannot find library item with library name #{element['library_name']},"\
                                        " version: #{element['library_version']} and question name #{element['name']}."
          end
          JSON.parse(library_question.question)
        else
          element
        end
      end
    end
    return questions
  end

  def validate_questions
    # fill_in_library_items will throw an exception if any library items are invalid.
    # If the questions are not valid JSON, JSON.parse will throw an exception.
    begin
      filled_questions = Foorm::Form.fill_in_library_items(JSON.parse(questions))
    rescue StandardError => e
      errors.add(:questions, e.message)
      return
    end
    filled_questions.deep_symbolize_keys!
    element_names = Set.new
    filled_questions[:pages].each do |page|
      page[:elements].each do |element_data|
        # validate_element will throw an exception if the element is invalid
        Foorm::Form.validate_element(element_data, element_names)
      rescue StandardError => e
        errors.add(:questions, e.message)
      end
    end
  end

  # Checks that the element name is not in element_names and the choices/rows/columns are unique and all have
  # value/text parameters. If any of the above are not true, will raise an InvalidFoormConfigurationError.
  def self.validate_element(element_data, element_names)
    return unless PANEL_TYPES.include?(element_data[:type]) || QUESTION_TYPES.include?(element_data[:type])
    if element_names.include?(element_data[:name])
      raise InvalidFoormConfigurationError, "Duplicate element name #{element_data[:name]}."
    end
    element_names.add(element_data[:name])
    if PANEL_TYPES.include?(element_data[:type])
      elements = element_data[:elements]
      if element_data[:type] == TYPE_PANEL_DYNAMIC
        elements = element_data[:templateElements]
      end
      elements.each do |panel_question_data|
        validate_element(panel_question_data, element_names)
      end
    elsif QUESTION_TYPES.include?(element_data[:type])
      validate_question(element_data)
    end
  end

  def self.validate_question(question_data)
    case question_data[:type]
    when TYPE_CHECKBOX, TYPE_RADIO, TYPE_DROPDOWN
      validate_choices(question_data[:choices], question_data[:name])
    when TYPE_MATRIX
      validate_choices(question_data[:rows], question_data[:name])
      validate_choices(question_data[:columns], question_data[:name])
    end
  end

  def self.validate_choices(choices, question_name)
    choice_values = Set.new
    choices.each do |choice|
      if choice.class == Hash && choice.key?(:value) && choice.key?(:text)
        if choice_values.include?(choice[:value])
          raise InvalidFoormConfigurationError, "Duplicate choice value #{choice[:value]} in question #{question_name}."
        end
        choice_values.add(choice[:value])
      elsif choice.class == String
        error_msg = "Foorm configuration contains question '#{question_name}' without key-value choice. Choice is '#{choice}'."
        raise InvalidFoormConfigurationError,  error_msg
      end
    end
  end

  def self.get_matrix_question_id(parent_question_id, sub_question_id)
    parent_question_id + '-' + sub_question_id
  end

  # For a given Form, this method will produce a CSV of all responses
  # received for that Form. It includes the content of the form submitted
  # by a user, as well as some additional metadata about the context
  # in which the form was submitted (eg, workshop ID, user ID).
  def submissions_to_csv(file_path)
    formatted_submissions = submissions.map(&:formatted_answers)

    CSV.open(file_path, "wb") do |csv|
      break if formatted_submissions.empty?

      # Submissions containing answers to facilitator-specific questions
      # don't have survey config stored in them.
      submission_with_survey_config = submissions.
        select {|submission| submission.workshop_metadata&.facilitator_id.nil?}&.
        last&.
        formatted_answers

      headers = submission_with_survey_config.nil? ?
        readable_questions :
        merge_form_questions_and_config_variables(submission_with_survey_config)

      csv << headers.values

      formatted_submissions.each do |submission|
        csv << submission.values_at(*headers.keys)
      end
    end
  end

  def parsed_questions
    Pd::Foorm::FoormParser.parse_forms([self])
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

  # Takes the questions in the survey (readable_questions)
  # and adds in entries for information
  # like survey configuration variables (eg, workshop_subject)
  # and workshop metadata (eg, pd_worskhop_id)
  # that appears in the form submission, but not the form itself.
  def merge_form_questions_and_config_variables(submission)
    headers = readable_questions

    config_and_metadata_question_ids = submission.keys.reject do |question_id|
      headers.keys.include? question_id
    end
    return headers if config_and_metadata_question_ids.empty?

    config_and_metadata_headers = Hash[config_and_metadata_question_ids.map {|question_id| [question_id, question_id]}]
    config_and_metadata_headers.merge! headers
  end
end
