# Categorizes survey questions and results

module Pd::Foorm
  class WorkshopCategorizer
    include Constants
    extend Helper

    def self.categorize_survey_data(parsed_forms_with_categories, summarized_answers, facilitators)
      form_categories = get_form_categories(parsed_forms_with_categories)
      categories = initialize_categories(form_categories)

      facilitators&.each do |facilitator_id, facilitator_name|
        categories[:facilitators][facilitator_id] = {
          name: facilitator_name,
          questions: {}
        }
      end

      process_general_questions_by_category(parsed_forms_with_categories, summarized_answers, categories)

      process_facilitator_questions_by_category(parsed_forms_with_categories, summarized_answers, facilitators, categories)

      categories
    end

    # Get all categories present in the survey forms
    def self.get_form_categories(parsed_forms_with_categories)
      categories = Set.new

      parsed_forms_with_categories[:general]&.each do |_form_key, questions|
        questions.each do |_question_name, question_data|
          if question_data[:category]
            categories.add(determine_category(question_data[:category]))
          end

          # Check matrix rows for categories
          if question_data[:original_type] == 'matrix' && question_data[:matrix_rows]
            question_data[:matrix_rows].each do |_row_key, row_data|
              if row_data[:category]
                categories.add(determine_category(row_data[:category]))
              end
            end
          end
        end
      end

      # Always ensure these core categories exist
      categories.add(:facilitators)

      categories.to_a.sort
    end

    # Initialize the category structure using form categories
    def self.initialize_categories(form_categories)
      categories_hash = {}
      form_categories.each do |category|
        categories_hash[category] = category == :facilitators ? {} : {questions: {}}
      end
      categories_hash
    end

    def self.determine_category(category_string)
      return unless category_string.is_a?(String) && !category_string.empty?
      category_string.downcase.to_sym
    end

    def self.process_general_questions_by_category(parsed_forms_with_categories, summarized_answers, categories)
      parsed_forms_with_categories[:general].each do |form_key, questions|
        form_summary = find_form_summary_in_answers(summarized_answers, form_key, :general)

        questions.each do |question_name, question_data|
          question_summary = form_summary&.dig(question_name)

          if question_data[:original_type] == 'matrix'
            process_matrix_question_by_category(question_name, question_data, question_summary, categories)
          else
            process_regular_question_by_category(question_name, question_data, question_summary, categories)
          end
        end
      end
    end

    def self.process_facilitator_questions_by_category(parsed_forms_with_categories, summarized_answers, facilitators, categories)
      return unless facilitators

      parsed_forms_with_categories[:facilitator].each do |form_key, questions|
        form_summary = find_form_summary_in_answers(summarized_answers, form_key, :facilitator)

        questions.each do |question_name, question_data|
          facilitators.each do |facilitator_id, facilitator_name|
            question_summary = form_summary&.dig(question_name, facilitator_id)

            if question_data[:original_type] == 'matrix'
              # For matrix questions in facilitator context, we need to process them differently
              # since they should stay grouped under the facilitator, not split by category
              process_facilitator_matrix_question(question_name, question_data, question_summary, categories, facilitator_id, facilitator_name)
            else
              category = determine_category(question_data[:category])
              next unless category

              processed_question = create_processed_question(question_name, question_data, question_summary, facilitator_name)
              categories[:facilitators][facilitator_id][:questions][question_name] = processed_question
            end
          end
        end
      end
    end

    def self.process_matrix_question_by_category(question_name, question_data, question_summary, categories, facilitator_name = nil)
      question_data[:matrix_rows].each do |row_key, row_data|
        row_summary = question_summary&.dig(row_key)

        category = determine_category(row_data[:category])
        next unless category

        # Replace facilitator name placeholder in text if provided
        row_text = row_data[:text]
        if facilitator_name && row_text
          row_text = replace_facilitator_name(row_text, facilitator_name)
        end

        row_short_text = row_data[:short_text]
        if facilitator_name && row_short_text
          row_short_text = replace_facilitator_name(row_short_text, facilitator_name)
        end

        processed_question = {
          question_name: row_key,
          question_text: row_text,
          question_short_text: row_short_text,
          question_type: 'likert',
          category: category,
          results: Pd::Foorm::ResponseProcessor.process_likert_responses(row_summary, question_data[:columns])
        }

        categories[category][:questions][row_key] = processed_question
      end
    end

    def self.process_regular_question_by_category(question_name, question_data, question_summary, categories)
      category = determine_category(question_data[:category])
      return unless category

      processed_question = create_processed_question(question_name, question_data, question_summary)
      categories[category][:questions][question_name] = processed_question
    end

    def self.process_facilitator_matrix_question(question_name, question_data, question_summary, categories, facilitator_id, facilitator_name)
      question_data[:matrix_rows].each do |row_key, row_data|
        category = determine_category(row_data[:category])
        next unless category

        row_summary = question_summary&.dig(row_key)

        # Replace facilitator name placeholder in text
        row_text = row_data[:text]
        if facilitator_name && row_text
          row_text = replace_facilitator_name(row_text, facilitator_name)
        end

        row_short_text = row_data[:short_text]
        if facilitator_name && row_short_text
          row_short_text = replace_facilitator_name(row_short_text, facilitator_name)
        end

        processed_question = {
          question_name: row_key,
          question_text: row_text,
          question_short_text: row_short_text,
          question_type: 'likert',
          category: category,
          results: Pd::Foorm::ResponseProcessor.process_likert_responses(row_summary, question_data[:columns])
        }

        categories[:facilitators][facilitator_id][:questions][row_key] = processed_question
      end
    end

    def self.create_processed_question(question_name, question_data, question_summary, facilitator_name = nil)
      # Replace facilitator name placeholder in question text if provided
      question_text = question_data[:title]
      if facilitator_name && question_text
        question_text = replace_facilitator_name(question_text, facilitator_name)
      end

      question_short_text = question_data[:short_text]
      if facilitator_name && question_short_text
        question_short_text = replace_facilitator_name(question_short_text, facilitator_name)
      end

      question_type =
        if question_data[:type] == ANSWER_RATING
          promoter_percentage_scale?(question_data) ? 'promoter' : 'likert'
        else
          question_data[:type]
        end

      base_question = {
        question_name: question_name,
        question_text: question_text,
        question_short_text: question_short_text,
        question_type: question_type,
        category: question_data[:category]
      }

      has_other = question_data[:has_other] || false

      base_question[:results] = case question_data[:type]
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

    def self.find_form_summary_in_answers(summarized_answers, form_key, question_type)
      summarized_answers.each do |_survey_key, survey_data|
        form_summary = survey_data.dig(question_type, form_key)
        return form_summary if form_summary
      end
      nil
    end

    # Determine if a rating question uses NPS scale (0-10) vs Likert scale (1-7)
    def self.promoter_percentage_scale?(question_data)
      rate_min = question_data[:rate_min] || LIKERT_MIN_RATING
      rate_max = question_data[:rate_max] || LIKERT_MAX_RATING

      # NPS-style: 0-10 scale (11 points)
      # Likert-style: 1-7 scale (7 points)
      rate_min == PROMOTER_MIN_RATING && rate_max == PROMOTER_MAX_RATING
    end

    def self.replace_facilitator_name(text, name)
      text.gsub('{panel.facilitator_name}', name)
    end
  end
end
