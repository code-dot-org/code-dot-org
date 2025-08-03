# Categorizes survey questions and responses

module Pd::Foorm
  class WorkshopCategorizer
    include Constants
    extend Helper

    # List of all valid categories
    CATEGORIES = [
      :implementation,
      :engagement,
      :logistics,
      :facilitators,
      :other
    ].freeze

    # Process survey data organized by categories
    def self.categorize_survey_data(parsed_forms_with_categories, summarized_answers, facilitators)
      categories = initialize_categories

      # Initialize facilitator categories
      facilitators&.each do |facilitator_id, facilitator_name|
        categories[:facilitators][facilitator_id] = {
          name: facilitator_name,
          questions: []
        }
      end

      # Process general questions
      process_general_questions_by_category(parsed_forms_with_categories, summarized_answers, categories)

      # Process facilitator questions
      process_facilitator_questions_by_category(parsed_forms_with_categories, summarized_answers, facilitators, categories)

      categories
    end

    # Initialize the category structure using CATEGORIES
    def self.initialize_categories
      categories_hash = {}
      CATEGORIES.each do |category|
        categories_hash[category] = category == :facilitators ? {} : {questions: []}
      end
      categories_hash
    end

    # Determine category with fallback to 'other', using CATEGORIES
    def self.determine_category(category_string)
      return :other unless category_string.is_a?(String)

      category = category_string.downcase.to_sym
      CATEGORIES.include?(category) ? category : :other
    end

    # Process general questions organized by category
    def self.process_general_questions_by_category(parsed_forms_with_categories, summarized_answers, categories)
      parsed_forms_with_categories[:general].each do |form_key, questions|
        form_summary = find_form_summary_in_answers(summarized_answers, form_key, :general)
        next unless form_summary

        questions.each do |question_name, question_data|
          question_summary = form_summary[question_name]
          next unless question_summary

          if question_data[:original_type] == 'matrix'
            process_matrix_question_by_category(question_name, question_data, question_summary, categories)
          else
            process_regular_question_by_category(question_name, question_data, question_summary, categories)
          end
        end
      end
    end

    # Process facilitator questions by category
    def self.process_facilitator_questions_by_category(parsed_forms_with_categories, summarized_answers, facilitators, categories)
      return unless facilitators

      parsed_forms_with_categories[:facilitator].each do |form_key, questions|
        form_summary = find_form_summary_in_answers(summarized_answers, form_key, :facilitator)
        next unless form_summary

        questions.each do |question_name, question_data|
          facilitators.each do |facilitator_id, facilitator_name|
            question_summary = form_summary.dig(question_name, facilitator_id)
            next unless question_summary

            if question_data[:original_type] == 'matrix'
              # For matrix questions in facilitator context, we need to process them differently
              # since they should stay grouped under the facilitator, not split by category
              process_facilitator_matrix_question(question_name, question_data, question_summary, categories, facilitator_id, facilitator_name)
            else
              processed_question = create_processed_question(question_name, question_data, question_summary, facilitator_name)
              categories[:facilitators][facilitator_id][:questions] << processed_question
            end
          end
        end
      end
    end

    # Process a matrix question by individual row categories
    def self.process_matrix_question_by_category(question_name, question_data, question_summary, categories, facilitator_name = nil)
      question_data[:matrix_rows].each do |row_key, row_data|
        row_summary = question_summary[row_key]
        next unless row_summary

        category = determine_category(row_data[:category])

        # Replace facilitator name placeholder in row text if provided
        row_text = row_data[:text]
        if facilitator_name && row_text
          row_text = row_text.gsub('{panel.facilitator_name}', facilitator_name)
        end

        # Replace facilitator name placeholder in row short text if provided
        row_short_text = row_data[:short_text]
        if facilitator_name && row_short_text
          row_short_text = row_short_text.gsub('{panel.facilitator_name}', facilitator_name)
        end

        processed_question = {
          question_name: row_key,
          question_text: row_text,
          question_short_text: row_short_text,
          question_sub_text: row_data[:sub_text],
          question_type: 'singleSelect',
          category: row_data[:category],
          responses: Pd::Foorm::ResponseProcessor.process_likert_responses(row_summary, question_data[:columns])
        }

        categories[category][:questions] << processed_question
      end
    end

    # Process a regular (non-matrix) question by category
    def self.process_regular_question_by_category(question_name, question_data, question_summary, categories)
      category = determine_category(question_data[:category])
      processed_question = create_processed_question(question_name, question_data, question_summary)
      categories[category][:questions] << processed_question
    end

    # Process facilitator matrix questions (keep them grouped under facilitator, not split by category)
    def self.process_facilitator_matrix_question(question_name, question_data, question_summary, categories, facilitator_id, facilitator_name)
      question_data[:matrix_rows].each do |row_key, row_data|
        row_summary = question_summary[row_key]
        next unless row_summary

        # Replace facilitator name placeholder in row text
        row_text = row_data[:text]
        if facilitator_name && row_text
          row_text = row_text.gsub('{panel.facilitator_name}', facilitator_name)
        end

        # Replace facilitator name placeholder in row short text if provided
        row_short_text = row_data[:short_text]
        if facilitator_name && row_short_text
          row_short_text = row_short_text.gsub('{panel.facilitator_name}', facilitator_name)
        end

        processed_question = {
          question_name: row_key,
          question_text: row_text,
          question_short_text: row_short_text,
          question_sub_text: row_data[:sub_text],
          question_type: 'singleSelect',
          category: row_data[:category],
          responses: Pd::Foorm::ResponseProcessor.process_likert_responses(row_summary, question_data[:columns])
        }

        categories[:facilitators][facilitator_id][:questions] << processed_question
      end
    end

    # Create a processed question with full response data
    def self.create_processed_question(question_name, question_data, question_summary, facilitator_name = nil)
      # Replace facilitator name placeholder in question text if provided
      question_text = question_data[:title]
      if facilitator_name && question_text
        question_text = question_text.gsub('{panel.facilitator_name}', facilitator_name)
      end

      # Replace facilitator name placeholder in question short text if provided
      question_short_text = question_data[:short_text]
      if facilitator_name && question_short_text
        question_short_text = question_short_text.gsub('{panel.facilitator_name}', facilitator_name)
      end

      base_question = {
        question_name: question_name,
        question_text: question_text,
        question_short_text: question_short_text,
        question_sub_text: question_data[:sub_text],
        question_type: question_data[:type],
        category: question_data[:category]
      }

      has_other = question_data[:has_other] || false

      base_question[:responses] = case question_data[:type]
                                  when ANSWER_SINGLE_SELECT
                                    Pd::Foorm::ResponseProcessor.process_single_select_responses(question_summary, question_data[:choices] || {}, has_other)
                                  when ANSWER_MULTI_SELECT
                                    Pd::Foorm::ResponseProcessor.process_multi_select_responses(question_summary, question_data[:choices] || {}, has_other)
                                  when ANSWER_RATING
                                    # Determine if this is Promoter percentage (0-10) or Likert (1-7) based on scale
                                    if promoter_percentage_scale?(question_data)
                                      Pd::Foorm::ResponseProcessor.process_rating_responses(question_summary, question_data[:choices] || {})
                                    else
                                      Pd::Foorm::ResponseProcessor.process_likert_responses(question_summary, question_data[:choices] || {})
                                    end
                                  when ANSWER_TEXT
                                    Pd::Foorm::ResponseProcessor.process_text_responses(question_summary)
                                  else
                                    question_summary
                                  end

      base_question
    end

    # Find form summary in answers dynamically
    def self.find_form_summary_in_answers(summarized_answers, form_key, question_type)
      summarized_answers.each do |_survey_key, survey_data|
        form_summary = survey_data.dig(question_type, form_key)
        return form_summary if form_summary
      end
      nil
    end

    # Determine if a rating question uses NPS scale (0-10) vs Likert scale (1-7)
    def self.promoter_percentage_scale?(question_data)
      rate_min = question_data[:rate_min] || 1
      rate_max = question_data[:rate_max] || 7

      # NPS-style: 0-10 scale (11 points)
      # Likert-style: 1-7 scale (7 points)
      rate_min == 0 && rate_max == 10
    end
  end
end
