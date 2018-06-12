# Include in models that represent a JotForm (3rd party survey tool) form
# This will enable syncing and data manipulation
#
# Required model attributes:
#  - form_id: JotForm form id
#  - submission_id: JotForm submission id
#  - answers: JotForm submission answer data
# Required JotForm question names:
#  - environment: Set to Rails.env, so we can filter out results from other environments
module Pd
  module JotFormBackedForm
    extend ActiveSupport::Concern

    included do
      before_validation :map_answers_to_attributes, if: :answers_changed?
      validates_presence_of :form_id, :submission_id
    end

    CACHE_TTL = 5.minutes.freeze

    def placeholder?
      answers.nil?
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

      # @return [Hash] mapping of model attributes to their respective JotForm question names,
      # from where they will be set before validation
      # @see map_answers_to_attributes
      def attribute_mapping
        {}
      end

      # Retrieve all form ids to sync
      # Override in included models
      def all_form_ids
        []
      end

      # Download new responses from JotForm for all relevant form ids
      def sync_all_from_jotform
        all_form_ids.compact.map {|form_id| sync_from_jotform(form_id)}.sum
      end

      def get_questions(form_id, force_sync: false)
        cache_key = "Pd::SurveyQuestion.#{form_id}"
        if force_sync
          # Force sync from jotform (which has an implicit DB save) and write to Rails cache
          Pd::SurveyQuestion.sync_from_jotform(form_id).tap do |questions|
            Rails.cache.write(cache_key, questions, expires_in: CACHE_TTL)
          end
        else
          # Attempt to fetch from cache, then db, then finally JotForm
          Rails.cache.fetch(cache_key, expires_in: CACHE_TTL) do
            Pd::SurveyQuestion.find_by(form_id: form_id) || Pd::SurveyQuestion.sync_from_jotform(form_id)
          end
        end
      end

      # Download new responses from JotForm
      def sync_from_jotform(form_id = nil)
        return sync_all_from_jotform unless form_id

        get_questions(form_id)

        JotForm::Translation.new(form_id).get_submissions(
          last_known_submission_id: get_last_known_submission_id(form_id),
          min_date: get_min_date(form_id)
        ).map do |submission|
          answers = submission[:answers]

          # When we pass the last_known_submission_id filter, there should be no duplicates,
          # But just in case handle them gracefully as an upsert.
          find_or_initialize_by(submission.slice(:form_id, :submission_id)).tap do |model|
            # Try first to parse the answers with existing question data. On first failure, force sync questions
            # and retry. Second failure will propagate and fail the entire sync operation.
            Retryable.retryable(sleep: 0, exception_cb: proc {model.force_sync_questions}) do
              model.answers = answers.to_json

              # Note, form_data_hash processes the answers and will raise an error if they don't match the questions.
              # Include hidden questions for full validation and so skip_submission? can inspect them.
              if skip_submission?(form_id, model.form_data_hash(show_hidden_questions: true))
                CDO.log.info "Skipping #{submission[:submission_id]}"
                next
              end
              model.save!
            end
          end
        rescue => e
          raise e, "Error processing submission #{submission[:submission_id]} for form #{form_id}: #{e.message}", e.backtrace
        end.compact
      end

      # Override in included class to provide custom filtering rules.
      # By default skip other environments. This assumes that environment is a property in the processed answers.
      # TODO(Andrew): Filter in the API query if possible, once we hear back from JotForm API support.
      # See https://www.jotform.com/answers/1483561-API-Filter-form-id-submissions-endpoint-with-question-and-answer#4
      # @param form_id [Integer]
      # @param processed_answers [Hash]
      # @return [Boolean] true if this submission should be skipped
      def skip_submission?(form_id, processed_answers)
        environment = processed_answers['environment']
        raise "Missing required environment field" unless environment

        # Skip other environments. Only keep this environment.
        return true if environment != Rails.env

        # Is it a duplicate? These will be prevented in the future, but for now log and skip
        # TODO(Andrew): prevent duplicates and remove this code.
        key_attributes = get_key_attributes(form_id, processed_answers)
        if exists?(key_attributes)
          CDO.log.warn "Submission already exists for #{key_attributes}, skipping"
          return true
        end

        false
      end

      def get_key_attributes(form_id, processed_answers)
        attribute_mapping.transform_values {|k| processed_answers[k]}
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
        forms[name].to_i
      end
    end

    # Update answers for this submission from the JotForm API
    # Useful for filling in placeholder response entries (submission id but no answers)
    def sync_from_jotform
      raise 'Missing submission id' unless submission_id.present?
      self.class.sync_questions_from_jotform form_id

      submission = JotForm::Translation.new(form_id).get_submission(submission_id)
      update!(answers: submission[:answers].to_json)
    end

    # Supplies values for important model attributes from the JotForm-downloaded form answers.
    # Run before validation.
    # Override attribute_mapping in included models to designate attributes to map.
    # @see attribute_mapping
    def map_answers_to_attributes
      hash = form_data_hash(show_hidden_questions: true)
      self.class.attribute_mapping.each do |attribute, question_name|
        write_attribute attribute, hash[question_name.to_s]
      end
    end

    def force_sync_questions
      @questions = self.class.get_questions(form_id, force_sync: true)
    end

    # Get questions for this form
    def questions
      @questions ||= self.class.get_questions(form_id)
    end

    # Answers json parsed in hash form
    def answers_hash
      JSON.parse answers
    end

    # Form data JSON
    def form_data
      form_data_hash.to_json
    end

    # Form data hash: answers data processed by up to date form questions
    # @see FormQuestions.process_answers
    def form_data_hash(show_hidden_questions: false)
      # memoize per show_hidden_questions value
      @form_data_hash ||= {}
      @form_data_hash[show_hidden_questions ? 'all' : 'visible'] ||= begin
        questions.process_answers(answers_hash, show_hidden_questions: show_hidden_questions)
      rescue => e
        raise e, "Error processing answers for submission id #{submission_id}, form #{form_id}: #{e}", e.backtrace
      end
    end

    def sanitize_form_data_hash
      @sanitized_form_data_hash ||=
        form_data_hash.transform_keys {|key| key.underscore.to_sym}
    end

    def answers=(value)
      write_attribute :answers, value
      clear_memoized_values
    end

    def reload
      super.tap do
        clear_memoized_values
      end
    end

    def clear_memoized_values
      @questions = nil
      @form_data_hash = nil
      @sanitized_form_data_hash = nil
    end
  end
end
