module Pd
  module JotFormBackedForm
    extend ActiveSupport::Concern

    included do
      before_validation :map_form_data_to_attributes
    end

    class_methods do
      def get_last_known_submission_id(form_id)
        [
          where(form_id: form_id).maximum(:submission_id),
          last_known_submission_id_override(form_id)
        ].compact.max
      end

      # Add jotform_last_submission_id_overrides to locals.yml to manually set minimum submission ids for sync.
      # The format is a hash, form_id => last_known_submission_id
      # This is useful to ignore older test submissions before we go live.
      def last_known_submission_id_override(form_id)
        CDO.jotform_last_submission_id_overrides.try do |override_hash|
          override_hash[form_id]
        end
      end

      # Add jotform_min_dates to locals.yml to manually set minimum submission dates for sync.
      # The format is a hash, form_id => date, e.g. {12345 => '2018-05-23'}
      # This is useful to ignore older test submissions before we go live.
      def get_min_date(form_id)
        CDO.jotform_min_dates.try do |min_date_hash|
          min_date_hash[form_id]
        end
      end

      def get_form_questions(form_id)
        survey_question = SurveyQuestion.find_by(form_id: form_id)
        raise KeyError, "No survey questions for for form #{form_id}" unless survey_question
        survey_question.form_questions
      end

      # @return [Hash] mapping of model attributes to their respective JotForm question names,
      # from where they will be set before validation
      # @see map_form_data_to_attributes
      def attribute_mapping
        {}
      end

      def form_ids
        []
      end

      def sync_all_from_jotform
        form_ids.map {|form_id| sync_from_jotform(form_id)}.sum
      end

      def sync_from_jotform(form_id = nil)
        return sync_all_from_jotform unless form_id

        JotForm::Translation.new(form_id).get_submissions(
          last_known_submission_id: get_last_known_submission_id(form_id),
          min_date: get_min_date(form_id)
        ).map do |submission|
          # TODO: don't stop the whole set when one fails

          answers = submission[:answers]

          # Process answers here as a validation. An error will be raised if they don't match the questions.
          processed_answers = questions_for_form(form_id).process_answers(answers)
          next if skip_submission?(processed_answers)

          # When we pass the last_known_submission_id filter, there should be no duplicates,
          # But just in case handle them gracefully as an upsert.
          find_or_initialize_by(submission.slice(:form_id, :submission_id)).tap do |model|
            model.update! answers: answers.to_json
          end
        rescue => e
          raise e, "Error processing submission #{submission[:submission_id]} for form #{form_id}: #{e.message}", e.backtrace
        end.compact
      end

      # Override in included class to provide filtering rules
      # TODO(Andrew): Filter in the API query if possible, once we hear back from JotForm API support.
      # See https://www.jotform.com/answers/1482175-API-Integration-Matrix-answer-returning-false-in-the-API#2
      # @param processed_answers [Hash]
      # @return [Boolean] true if this submission should be skipped
      def skip_submission?(processed_answers)
        false
      end

      # Get a form id from the configuration
      # These can be supplied in globals.yml or locals.yml in the form:
      #   jotform_forms:
      #     {category}:
      #       {name}: {id}
      # @param category [String]
      # @param name [String]
      # @raises [KeyError] when either the category or name cannot be found
      # @return [Integer] form id
      def get_form_id(category, name)
        raise KeyError, "Missing jotform form category #{category}" unless CDO.jotform_forms&.key? category
        forms = CDO.jotform_forms[category]
        raise KeyError, "Mising jotform form: #{category}.#{name}" unless forms.key? name
        forms[name]
      end

      def questions_for_form(form_id)
        survey_question = SurveyQuestion.find_by(form_id: form_id)
        raise KeyError, "No survey questions for form #{form_id}" unless survey_question
        survey_question.form_questions
      end
    end

    def map_form_data_to_attributes
      self.class.attribute_mapping.each do |attribute, question_name|
        write_attribute attribute, form_data_hash[question_name.to_s]
      end
    end

    def questions
      @questions ||= self.class.get_form_questions(form_id)
    end

    def answers_hash
      JSON.parse answers
    end

    def form_data
      form_data_hash.to_json
    end

    def form_data_hash
      @form_data_hash ||= begin
        questions.process_answers(answers_hash)
      rescue => e
        raise e, "Error processing answers for submission id #{submission_id}, form #{form_id}: #{e}", e.backtrace
      end
    end

    def sanitize_form_data_hash
      @sanitized_form_data_hash ||=
        form_data_hash.transform_keys {|key| key.underscore.to_sym}
    end

    def answers=(value)
      @form_data_hash = nil
      write_attribute :answers, value
    end

    def reload
      @form_data_hash = nil
      super
    end
  end
end
