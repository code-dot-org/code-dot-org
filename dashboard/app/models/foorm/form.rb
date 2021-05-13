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
#  published  :boolean          default(TRUE), not null
#
# Indexes
#
#  index_foorm_forms_on_name_and_version  (name,version) UNIQUE
#

class Foorm::Form < ApplicationRecord
  include Seeded
  include Pd::Foorm::Constants

  class InvalidFoormConfigurationError < StandardError; end

  has_many :submissions, foreign_key: [:form_name, :form_version], primary_key: [:name, :version]

  validate :validate_questions, :validate_published

  after_commit :write_form_to_file

  # We have a uniqueness constraint on form name and version for this table.
  # This key format is used elsewhere in Foorm to uniquely identify a form.
  def key
    "#{name}.#{version}"
  end

  def self.setup
    # Seed all forms inside of a transaction, such that all forms are imported/updated successfully
    # or none at all.
    ActiveRecord::Base.transaction do
      Dir.glob('config/foorm/forms/**/*.json').each do |path|
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

        # if published is not provided, default to true
        questions_parsed = JSON.parse(questions)
        published = questions_parsed['published'].nil? ? true : questions_parsed['published']

        form = Foorm::Form.find_or_initialize_by(name: full_name, version: version)
        form.questions = questions
        form.published = published
        form.save! if form.changed?
      rescue JSON::ParserError
        raise format('failed to parse %s', full_name)
      end
    end
  end

  def validate_questions
    errors_arr = Foorm::Form.validate_questions(JSON.parse(questions))
    errors_arr.each {|error| errors[:questions] << error}
  end

  def validate_published
    parsed_questions = JSON.parse(questions)

    unless parsed_questions['published'].nil?
      if published != parsed_questions['published']
        errors[:questions] << 'Mismatch between published state in questions and published state in model'
      end
    end
  end

  def write_form_to_file
    if write_to_file? && saved_changes?
      file_path = Rails.root.join("config/foorm/forms/#{name}.#{version}.json")
      file_directory = File.dirname(file_path)
      unless Dir.exist?(file_directory)
        FileUtils.mkdir_p(file_directory)
      end
      File.write(file_path, questions)
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

  def self.validate_questions(questions)
    # fill_in_library_items will throw an exception if any library items are invalid.
    # If the questions are not valid JSON, JSON.parse will throw an exception.
    errors = []
    begin
      filled_questions = Foorm::Form.fill_in_library_items(questions)
    rescue StandardError => e
      errors.append(e.message)
      return errors
    end
    filled_questions.deep_symbolize_keys!
    element_names = Set.new
    filled_questions[:pages]&.each do |page|
      page[:elements]&.each do |element_data|
        # validate_element will throw an exception if the element is invalid
        Foorm::Form.validate_element(element_data, element_names)
      rescue StandardError => e
        errors.append(e.message)
      end
    end
    errors
  end

  # Checks that the element name is not in element_names and the choices/rows/columns are unique and all have
  # value/text parameters. If any of the above are not true, will raise an InvalidFoormConfigurationError.
  # Note that this method is also used to validate library_questions.
  def self.validate_element(element_data, element_names)
    return unless PANEL_TYPES.include?(element_data[:type]) || QUESTION_TYPES.include?(element_data[:type])
    unless element_data[:name]
      raise InvalidFoormConfigurationError, "No name provided for element with title ''#{element_data[:title]}''"
    end
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
      elsif choice.class == Hash
        unless choice.key?(:value)
          error_msg = "Foorm configuration contains question '#{question_name}' without a  value for a choice. Choice text is '#{choice[:text]}'."
          raise InvalidFoormConfigurationError, error_msg
        end
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
  # @param submissions_to_report: optional array of submissions to write to csv.
  # If any submissions in the array do not belong to this form they will not be written
  # to the csv.
  # @return csv text
  def submissions_to_csv(submissions_to_report=nil)
    calculated_readable_questions = readable_questions
    headers = calculated_readable_questions[:general]
    has_facilitator_questions = !(calculated_readable_questions[:facilitator].nil_or_empty?)
    filtered_submissions = submissions_to_report || submissions

    if has_facilitator_questions
      filtered_submissions = filtered_submissions.
        reject do |submission|
          submission.workshop_metadata&.facilitator_specific?
        end
    end

    # Default headers are the non-facilitator specific set of questions.
    parsed_answers = []
    filtered_submissions.each do |submission|
      next if submission.form_name != name || submission.form_version != version
      answers = submission.formatted_answers

      # Add in new headers for questions that are not in the form
      # but are in the submission (eg, survey config and workshop metadata).
      # Put new headers first, as they generally contain important general
      # information (eg, user_id, pd_workshop_id, etc.)
      potential_new_headers = Hash[
        answers.keys.map do |question_id|
          if headers.key?(question_id)
            [nil, nil]
          else
            [question_id, question_id]
          end
        end
      ].compact

      headers = potential_new_headers.merge headers

      # look for associated facilitator questions if the form has facilitator questions.
      if has_facilitator_questions
        associated_facilitator_submissions = submission.associated_facilitator_submissions

        if associated_facilitator_submissions
          associated_facilitator_submissions.each_with_index do |facilitator_response, index|
            next if facilitator_response.nil?
            facilitator_number = index + 1

            # Add facilitator number identifier to facilitator-specific questions
            facilitator_headers_with_facilitator_number = readable_questions_with_facilitator_number(
              calculated_readable_questions,
              facilitator_number
            )

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
      end

      # Add combined general and facilitator answers to an array
      parsed_answers << answers
    end

    # Now we know all the headers, create comma_separated_submissions with answers for all headers (filling in with
    # nil where necessary)
    comma_separated_submissions = []
    parsed_answers.each {|answers| comma_separated_submissions << answers.values_at(*headers.keys)}

    rows_to_write = [headers.values]
    comma_separated_submissions.each {|row| rows_to_write << row}

    # Finally, add the header row and, subsequently, rows of survey responses.
    csv_result = CSV.generate do |csv|
      rows_to_write.each {|row| csv << row}
    end

    csv_result
  end

  # For a given question_id, gets information about the question (eg, type, choices, question text).
  # @param [String] question_id
  # @return [Hash]
  def get_question_details(question_id)
    parsed_questions(true)[question_id]
  end

  # Returns a readable version of the questions asked in a Form.
  # @param [Boolean] should_flatten
  # @return [Hash] Hash with two keys (:general and :facilitator), or those two hashes merged if the should_flatten parameter is true.
  def parsed_questions(should_flatten = false)
    @parsed_questions ||= Pd::Foorm::FoormParser.parse_form_questions(questions)

    should_flatten ?
      @parsed_questions[:general].merge!(@parsed_questions[:facilitator]) :
      @parsed_questions
  end

  # Returns a hash with keys matching what is produced by parsed_questions.
  # Each item is comprised of a question key, and a human readable question as its value.
  # It also flattens matrix questions into one entry per question.
  def readable_questions
    questions = {}

    # As of September 2020, the keys here are :general and :facilitator.
    parsed_questions.each do |questions_section, questions_content|
      questions[questions_section] = {}
      next if questions_content.nil_or_empty?

      questions_content.each do |question_id, question_details|
        if question_details[:type] == ANSWER_MATRIX
          matrix_questions = question_details[:rows]
          matrix_questions.each do |matrix_question_id, matrix_question_text|
            matrix_key = self.class.get_matrix_question_id(question_id, matrix_question_id)
            questions[questions_section][matrix_key] = question_details[:title] + ' >> ' + matrix_question_text
          end
        else
          questions[questions_section][question_id] = question_details[:title]
        end
      end
    end

    questions
  end

  def readable_questions_with_facilitator_number(questions, number)
    Hash[
      questions[:facilitator].map do |question_id, question_text|
        [question_id + "_#{number}", "Facilitator #{number}: " + question_text]
      end
    ]
  end

  def write_to_file?
    Rails.application.config.levelbuilder_mode
  end
end
