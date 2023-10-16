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
      after_initialize -> {assign_attributes self.class.static_attribute_values}, if: :new_record?

      scope :placeholders, -> {where(answers: nil)}
      scope :with_answers, -> {where.not(answers: nil)}
    end

    CACHE_TTL = 5.minutes.freeze

    # Max limit is 1000. See https://api.jotform.com/docs/#form-id-submissions
    JOT_FORM_LIMIT = 1000

    SYNC_SUBMISSION_RESULTS = [
      IMPORTED = :imported,
      SKIPPED_DULICATE = :skipped_dulicate,
      SKIPPED_DIFFERENT_ENVIRONMENT = :skipped_different_environment,
      ERROR = :error
    ].freeze

    def placeholder?
      answers.nil?
    end

    class_methods do
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

      # Names of attributes required to create a placeholder or determine if a new submission is unique
      # @return [Array<String>]
      def unique_attributes
        []
      end

      # Default attributes that will be present on all new records including placeholders,
      # and used in the duplicate checks.
      # This can be used for things like year that are specified in model and change infrequently.
      # @return [Hash]
      def static_attribute_values
        {}
      end

      # Download new responses from JotForm for all relevant form ids
      def sync_all_from_jotform
        sync_from_jotform
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

      # Wrap the constant so it can be mocked in tests
      def sync_batch_size
        JOT_FORM_LIMIT
      end

      # Download new responses from JotForm
      # @param [form_id] (optional) specify a form id. Otherwise use all forms
      def sync_from_jotform(form_id = nil)
        form_ids = form_id ? [form_id] : all_form_ids.uniq
        _sync_from_jotform form_ids
      end

      # Sync all new results from a given set of JotForm form ids, in batches
      def _sync_from_jotform(form_ids)
        # Errors per form, per submission. Format: {form_id: {submission_id: error}}
        errors_per_form = Hash.new {|h, k| h[k] = Hash.new}
        imported = 0
        batches = 0
        all_sync_results = {}

        form_ids.each do |form_id|
          questions = get_questions(form_id, force_sync: true)
          questions_details = use_names_for_question_ids? ? JSON.parse(questions.questions) : nil
          # Make sure that there is a unique, non-nil name for each question.
          if questions_details && (questions_details.pluck("name").compact.uniq.size != questions_details.size)
            raise "Not all questions for form #{form_id} have unique names."
          end

          last_known_submission_id = questions.last_submission_id
          last_processed_submission_id = last_known_submission_id
          all_sync_results[form_id] = {}

          offset = 0
          status = :importing
          while status == :importing
            batches += 1
            batch_error_count = 0

            response = JotForm::Translation.new(form_id).get_submissions(
              last_known_submission_id: last_known_submission_id,
              min_date: get_min_date(form_id),
              limit: sync_batch_size,
              offset: offset
            )

            result_set = response[:result_set]
            response[:submissions].each do |submission|
              submission_id = submission[:submission_id]
              begin
                res = process_submission(submission, questions_details)
                all_sync_results[form_id][res] ||= 0
                all_sync_results[form_id][res] += 1

                last_processed_submission_id = submission_id
                imported += 1 if res == IMPORTED
              rescue => exception
                # Store message and first line of backtrace for context
                errors_per_form[form_id][submission_id] = "#{exception.message}, #{exception.backtrace.first}"
                batch_error_count += 1
                all_sync_results[form_id][ERROR] ||= 0
                all_sync_results[form_id][ERROR] += 1

                # TODO: Save list of submissions we failed to import to a file or table.
                # Have another job to re-sync these submissions later.
              end

              questions.update!(last_submission_id: last_processed_submission_id) if
               last_processed_submission_id != questions.last_submission_id
            end

            if batch_error_count > 0 && batch_error_count == result_set[:count]
              # The whole batch failed. Don't bother processing more batches.
              # This might be a bigger issue.
              # Abort this form, but still continue trying to import any remaining forms
              errors_per_form[form_id][:all] = 'Entire batch failed. Aborting'
              status = :aborted
            elsif result_set[:count] == sync_batch_size
              offset += sync_batch_size
            else
              status = :complete
            end
          end
        end

        CDO.log.info("#{imported} JotForm submissions imported in #{batches} #{'batch'.pluralize(batches)}. " \
          "All sync results: #{all_sync_results.inspect}"
        )

        if errors_per_form.any?
          # Format error messages nicely and raise
          msg = "Error syncing JotForm submissions for forms #{form_ids}. Errors:\n"
          errors_per_form.each do |form_id, form_errors|
            msg << "  Form #{form_id}\n"
            form_errors.each do |submission_id, error|
              msg << "    Submission #{submission_id}: #{error}\n"
            end
          end
          raise msg
        end

        imported
      end

      # Process a submission and saves the model.
      # @param [submission] The submission received from JotForm.
      # @param [questions_details] (optional) Details of the questions.  If provided, we can
      #   attempt to use the name field from each question rather than its numerical ID when
      #   storing answers.
      # @return [symbol] one of the PROCESS_SUBMISSION_RESULT states
      def process_submission(submission, questions_details = nil)
        # There should be no duplicates, but just in case handle them gracefully as an upsert.
        find_or_initialize_by(submission.slice(:form_id, :submission_id)).tap do |model|
          dest_answers = model.process_answers_from_submission(submission[:answers], questions_details)

          model.answers = dest_answers.to_json
          form_id = submission[:form_id]
          submission_id = submission[:submission_id]

          # Note, form_data_hash processes the answers and will raise an error if they don't match the questions.
          # Include hidden questions for full validation and so skip_submission? can inspect them.
          processed_answers = model.form_data_hash(show_hidden_questions: true)
          if skip_submission?(processed_answers)
            CDO.log.info "Skipping #{processed_answers['environment']} environment submission #{submission_id}"
            return SKIPPED_DIFFERENT_ENVIRONMENT
          end

          # Make sure we have all attributes then see if this is a duplicate
          model.map_answers_to_attributes
          if model.duplicate?
            CDO.log.warn "Skipping duplicate submission #{submission_id}"
            return SKIPPED_DULICATE
          end

          model.save!
          CDO.log.info "Saved submission #{submission_id} for form #{form_id}"
        end

        IMPORTED
      end

      # Override in included class to provide custom filtering rules.
      # By default skip other environments. This assumes that environment is a property in the processed answers.
      # @param processed_answers [Hash]
      # @return [Boolean] true if this submission should be skipped
      def skip_submission?(processed_answers)
        environment = processed_answers['environment']

        # Environment is expected if any values are provided.
        if environment.blank?
          supplied_answers = processed_answers.select {|_, v| v.present?}
          raise "Missing environment. Other answers are present: #{supplied_answers}" if supplied_answers.any?
        end

        # Only keep this environment. Skip others.
        return true if environment != Rails.env

        false
      end

      # Override in included class to enable use of name instead of id for question identifier.
      # @return [Boolean] true if name should be used when possible for question identifier.
      def use_names_for_question_ids?
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

        raise KeyError, "Mising jotform form: #{category}.#{name}" if forms[name].blank?
        forms[name]&.to_i
      end

      # Download answers from JotForm for any placeholders in the current scope
      def fill_placeholders
        # Collect errors by submission id
        errors = {}
        count = 0
        synced_question_form_ids = Set.new
        placeholders.find_each do |placeholder|
          begin
            placeholder.sync_from_jotform
          rescue
            # This form has already had its questions re-synced. Fail out.
            raise if synced_question_form_ids.include? placeholder.form_id

            # The first time a sync fails for a particular form id, try to re-sync the questions and try again.
            synced_question_form_ids << placeholder.form_id
            placeholder.force_sync_questions
            placeholder.sync_from_jotform
          end

          count += 1
        rescue => exception
          # Store message and first line of backtrace for context
          errors[placeholder.submission_id] = "#{exception.message}, #{exception.backtrace.first}"
        end

        CDO.log.info "#{count} placeholders filled."

        if errors.any?
          # Format error messages nicely and raise
          msg = "Errors filling #{name} placeholders:\n"
          errors.each do |submission_id, error|
            msg << "  Submission #{submission_id}: #{error}"
          end
          raise msg
        end
      end

      # @return custom unique attributes plus form_id, which is always a unique attribute
      def unique_attributes_with_form_id
        unique_attributes.append(:form_id).uniq
      end

      # Make sure all expected keys are present
      # @param attrs [Hash] attributes for creating a placeholder or verifying uniqueness
      # @raise when missing an expected unique attribute
      # @return [Hash] pass through attrs merged with any static_attribute_values
      def validate_unique_attributes(attrs)
        attrs.merge(static_attribute_values).tap do |attrs_with_statics|
          missing = unique_attributes_with_form_id - attrs_with_statics.keys
          raise "Missing required attributes #{missing} in #{attrs_with_statics}" if missing.any?
        end
      end

      def response_exists?(attrs)
        exists? validate_unique_attributes(attrs)
      end

      def create_placeholder!(attrs)
        attrs = validate_unique_attributes(attrs)
        submission_id = attrs.delete :submission_id
        raise "Expected submission_id in #{attrs}" unless submission_id

        find_or_initialize_by(attrs).tap do |placeholder|
          if placeholder.persisted? && placeholder.submission_id != submission_id
            CDO.log.warn "Ignoring duplicate placeholder. Original: #{placeholder.submission_id}, New: #{submission_id}"
          else
            placeholder.submission_id = submission_id
            placeholder.save!
          end
        end
      end
    end

    # Detect duplicate submissions based on a subset of attributes designated unique
    # @see unique_attributes
    def duplicate?
      new_record? && self.class.exists?(slice(*self.class.unique_attributes_with_form_id))
    end

    # Given answers and questions, returns the correct form of answers.
    # In the case of a submission where we have the questions, and the survey
    # model returns true for use_names_for_question_ids?, then the answers have
    # keys as question names rather than question ID integers where possible.
    # @param source_answers [Hash] The submitted answers with keys as ID integers.
    # @param questions [Hash] (optional) The questions for this survey.
    def process_answers_from_submission(source_answers, questions = nil)
      dest_answers = {}

      source_answers.each do |key, value|
        # We have an answer ID, but can we get a name instead of the ID?
        question_detail = questions&.find {|q| q["id"] == key}

        # If we want to use names instead of IDs, and we got a name, then use it.
        if self.class.use_names_for_question_ids? && question_detail && question_name = question_detail["name"]
          dest_answers[question_name] = value
        else
          dest_answers[key] = value
        end
      end

      dest_answers
    end

    # Update answers for this submission from the JotForm API
    # Useful for filling in placeholder response entries (submission id but no answers)
    def sync_from_jotform
      raise 'Missing submission id' if submission_id.blank?

      submission = JotForm::Translation.new(form_id).get_submission(submission_id)
      questions_details = self.class.use_names_for_question_ids? ? JSON.parse(questions.questions) : nil
      dest_answers = process_answers_from_submission(submission[:answers], questions_details)
      update!(answers: dest_answers.to_json)
    end

    # Supplies values for important model attributes from the JotForm-downloaded form answers.
    # Run before validation.
    # Override attribute_mapping in included models to designate attributes to map.
    # @see attribute_mapping
    def map_answers_to_attributes
      hash = form_data_hash(show_hidden_questions: true)
      self.class.attribute_mapping.each do |attribute, question_name|
        write_attribute attribute, hash[question_name.to_s] if hash[question_name.to_s]
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
      answers ? JSON.parse(answers) : {}
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
      rescue => exception
        raise exception, "Error processing answers for submission id #{submission_id}, form #{form_id}: #{exception}", exception.backtrace
      end
    end

    def sanitized_form_data_hash
      @sanitized_form_data_hash ||=
        form_data_hash.transform_keys {|key| key.underscore.to_sym}
    end

    def answers=(value)
      write_attribute :answers, value&.strip_utf8mb4
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
