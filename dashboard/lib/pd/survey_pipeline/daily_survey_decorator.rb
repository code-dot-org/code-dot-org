module Pd::SurveyPipeline
  class DailySurveyDecorator < SurveyPipelineWorker
    FORM_IDS_TO_NAMES = {
      "90066184161150".to_i => {
        full_name: 'CS Fundamentals Deep Dive Pre-survey',
        short_name: 'Pre Workshop'
      },
      "90065524560150".to_i => {
        full_name: 'CS Fundamentals Deep Dive Post-survey',
        short_name: 'Post Workshop'
      },
      "91405279991164".to_i => {
        full_name: 'Facilitator Feedback Survey',
        short_name: 'Facilitator'
      }
    }

    # @param context [Hash] contains necessary input for this worker to process.
    #   Results are added back to the context object.
    #
    # @return [Hash] the same context object.
    #
    # @raise [RuntimeError] if required input keys are missing.
    #
    def self.process_data(context)
      results = decorate context.slice(*self::INPUT_KEYS)

      self::OUTPUT_KEYS.each do |key|
        next unless results.key?(key)
        if results[key].is_a? Hash
          context[key] ||= {}
          context[key].deep_merge! results[key]
        elsif results[key].is_a? Array
          context[key] ||= []
          context[key] += results[key]
        else
          raise "Not supported result type!"
        end
      end

      context
    end

    def self.data_visible_to_user?(user, data)
      return false unless user

      # Can user see this facilitator-specific data?
      if data[:facilitator_id]
        return false unless user.program_manager? ||
          user.workshop_organizer? ||
          user.workshop_admin? ||
          user.id == data[:facilitator_id]
      end

      true
    end

    def self.get_form_short_name(form_id)
      FORM_IDS_TO_NAMES.dig(form_id, :short_name) || form_id.to_s
    end

    # Index question collection by form id and question name.
    #
    # @param questions [Hash{form_id => {question_id => question_content}}]
    #   question_content is Hash{:type, :name, :text, :order, :hidden}.
    #   @see DailySurveyParser parse_survey function to see how questions data is created.
    #
    # @return [Hash{form_id => {question_name => question_content}}]
    #
    def self.index_question_by_names(questions)
      q_indexes = {}
      questions&.each do |form_id, form_questions|
        form_questions.each do |_, q_content|
          q_indexes[form_id] ||= {}
          q_indexes[form_id][q_content[:name]] = q_content.except(:name)
        end
      end

      q_indexes
    end

    def self.find_first_question_text(parsed_questions, q_name)
      parsed_questions&.each_pair do |_, form_questions|
        form_questions.each_pair do |_, qcontent|
          if qcontent[:name] == q_name
            return qcontent[:text]
          end
        end
      end
    end
  end

  # TODO: update test to test base and child classes!
  class SingleWorkshopResultDecorator < DailySurveyDecorator
    INPUT_KEYS = [:summaries, :parsed_questions, :parsed_submissions, :current_user, :errors]
    OUTPUT_KEYS = [:decorated_summaries]

    # Combine summary data and parsed data into a format that UI client will understand.
    #
    # @param summaries [Array<Hash>] an array of summary results.
    # @param parsed_questions [Hash] question data get from DailySurveyParser.
    # @param parsed_submissions [Hash] submission data get from DailySurveyParser.
    # @param current_user [User] user making survey report request.
    # @param errors [Array] non-fatal errors encounterd when calculating survey summaries.
    #
    # @return [Hash] data returned to client.
    #
    def self.decorate(summaries:, parsed_questions:, parsed_submissions:, current_user:, errors: [])
      result = {
        course_name: nil,
        questions: {},
        this_workshop: {},
        errors: errors
      }

      question_by_names = index_question_by_names(parsed_questions)

      # Populate entries for result[:this_workshop] and result[:questions]
      summaries.each do |summary|
        # Only process summarization for specific workshops and forms.
        form_id = summary[:form_id]
        workshop_id = summary[:workshop_id]
        next unless workshop_id && form_id

        # Check if the current user can see specific data
        next unless data_visible_to_user?(current_user, summary)

        form_name = get_form_short_name(form_id)
        q_name = summary[:name]

        # Create top structures if not already created
        result[:course_name] ||= Pd::Workshop.find_by_id(workshop_id)&.course
        result[:this_workshop][form_name] ||= {
          response_count: parsed_submissions[form_id].size,
          general: {},
          facilitator: {}
        }
        result[:questions][form_name] ||= {general: {}, facilitator: {}}

        # Create an entry in result[:this_workshop].
        # General format:
        # Hash{form_name => {response_count => number, general => {question_name => summary_result}}}
        #
        # Format for facilitator-specific result:
        # Hash{form_name => {response_count => number,
        #   facilitator => {question_name => {factilitator_name => summary_result}}}}
        #
        if summary[:facilitator_id]
          facilitator_name = User.find_by_id(summary[:facilitator_id])&.name ||
            summary[:facilitator_id].to_s

          result[:this_workshop][form_name][:facilitator][q_name] ||= {}
          result[:this_workshop][form_name][:facilitator][q_name][facilitator_name] =
            summary[:reducer_result]
        else
          result[:this_workshop][form_name][:general][q_name] = summary[:reducer_result]
        end

        # Create an entry in result[:questions].
        # General question format:
        # Hash{form_name => {general => {question_name => question_content}}}
        #
        # Facilitator question format:
        # Hash{form_name => {facilitator => {question_name => question_content}}}
        #
        q_content = question_by_names.dig(form_id, q_name)
        if summary[:facilitator_id]
          result[:questions][form_name][:facilitator][q_name] ||= q_content
        else
          result[:questions][form_name][:general][q_name] ||= q_content
        end
      end

      {decorated_summaries: result}
    end
  end

  class FacilitatorRollupResultDecorator < DailySurveyDecorator
    INPUT_KEYS = [:summaries, :facilitator_ids, :current_workshop, :facilitator_submissions, :parsed_questions, :errors]
    OUTPUT_KEYS = [:decorated_summaries]

    def self.decorate(summaries:, facilitator_ids:, current_workshop:, facilitator_submissions:, parsed_questions:, errors: [])
      result = {
        facilitators: {},
        facilitator_response_counts: {this_workshop: {}, all_my_workshops: {}},
        facilitator_averages: {},
        current_workshop: current_workshop.id,
        related_workshops: {},
        errors: errors
      }

      # Populate result[:facilitators] = {fac_id => fac_name}
      # Populate result[:facilitator_response_counts] =
      # {this_workshop => {fac_id => count}, all_my_workshops => {fac_id => count}}
      facilitator_ids.each do |id|
        result[:facilitators][id] = User.find(id)&.name || "UserId_#{id}"
        result[:facilitator_response_counts][:all_my_workshops][id] =
          facilitator_submissions.where(facilitator_id: id).count
        result[:facilitator_response_counts][:this_workshop][id] =
          facilitator_submissions.where(facilitator_id: id, pd_workshop_id: current_workshop.id).count
      end

      # Populate result[:facilitator_averages]
      # result[:facilitator_averages][fac_name] = {qname, qcategory => {this_workshop, all_my_workshops => score}}
      # result[:facilitator_averages][:questions] = {qname => qtext}
      fac_scores = result[:facilitator_averages]
      qtexts = {}
      summaries.each do |summary|
        fac_id = summary[:facilitator_id]
        next unless fac_id && facilitator_ids.include?(fac_id)

        fac_name = result[:facilitators][fac_id]
        q_name = summary[:name]
        scope =
          if summary[:workshop_id] == current_workshop.id
            :this_workshop
          elsif !summary[:workshop_id]
            :all_my_workshops
          else
            # TODO: add non-fatal error
            :wrong_scope
          end

        fac_scores[fac_name] ||= {}
        fac_scores[fac_name][q_name] ||= {}
        fac_scores[fac_name][q_name][scope] = summary[:reducer_result]

        qtexts[q_name] = find_first_question_text(parsed_questions, q_name)
      end

      # Replace name of questions in this category just to make the UI happy
      # Example: facilitator_effectiveness_<hash_string> -> facilitator_effectiveness_<index_number>
      category_name = 'facilitator_effectiveness'
      qname_replacement = {}
      qtexts.each_pair do |q_name, _|
        if q_name.start_with?(category_name) && !qname_replacement.key?(q_name)
          qname_replacement[q_name] = "#{category_name}_#{qname_replacement.length}"
        end
      end
      qtexts.transform_keys! {|k| qname_replacement[k] || k}

      # Calculate category average and replace question name for each facilitator
      fac_scores.each_pair do |_, question_scores|
        question_scores.transform_keys! {|k| qname_replacement[k] || k}

        scores = question_scores.values_at(*qname_replacement.values).compact
        this_workshop_scores = scores.pluck(:this_workshop)
        all_workshop_scores = scores.pluck(:all_my_workshops)

        question_scores[category_name] = {}
        question_scores[category_name][:this_workshop] =
          (this_workshop_scores.sum * 1.0 / this_workshop_scores.length).round(2)
        question_scores[category_name][:all_my_workshops] =
          (all_workshop_scores.sum * 1.0 / all_workshop_scores.length).round(2)
      end

      fac_scores[:questions] = qtexts

      {decorated_summaries: result}
    end
  end

  class WorkshopRollupResultDecorator < DailySurveyDecorator
    INPUT_KEYS = [:summaries, :facilitator_id, :current_workshop, :related_workshop_ids, :workshop_submissions, :parsed_questions, :errors]
    OUTPUT_KEYS = [:decorated_summaries]

    QUESTION_CATEGORIES = [
      WORKSHOP_OVERALL_SUCCESS_CATEGORY = 'overall_success',
      WORKSHOP_TEACHER_ENGAGEMENT_CATEGORY = 'teacher_engagement'
    ]

    # TODO: use **params, like rails
    def self.decorate(summaries:, facilitator_id:, current_workshop:, related_workshop_ids:, workshop_submissions:, parsed_questions:, errors: [])
      result = {
        facilitators: {},
        workshop_response_counts: {this_workshop: {}, all_my_workshops: {}},
        workshop_averages: {},
        current_workshop: current_workshop.id,
        related_workshops: {},
        errors: errors
      }

      # Populate result[:facilitators] = {fac_id => fac_name}
      fac_name = User.find(facilitator_id)&.name || "UserId_#{facilitator_id}"
      result[:facilitators][facilitator_id] = fac_name

      # Populate related workshops
      result[:related_workshops][fac_name] = related_workshop_ids

      # Populate result[:workshop_response_counts] =
      # {this_workshop => {fac_id => count}, all_my_workshops => {fac_id => count}}
      result[:workshop_response_counts][:all_my_workshops][facilitator_id] =
        workshop_submissions.count
      result[:workshop_response_counts][:this_workshop][facilitator_id] =
        workshop_submissions.where(pd_workshop_id: current_workshop.id).count

      # Populate result[:workshop_averages]
      # result[:workshop_averages][fac_name] = {qname, qcategory => {this_workshop, all_my_workshops => score}}
      # result[:workshop_averages][:questions] = {qname => qtext}
      ws_scores = result[:workshop_averages]
      qtexts = {}   # {qname => text}
      summaries.each do |summary|
        scope =
          if summary[:workshop_id] == current_workshop.id
            :this_workshop
          elsif !summary[:workshop_id]
            :all_my_workshops
          else
            # TODO: add non-fatal error
            :wrong_scope
          end
        next if scope == :wrong_scope

        q_name = summary[:name]
        ws_scores[fac_name] ||= {}
        ws_scores[fac_name][q_name] ||= {}
        ws_scores[fac_name][q_name][scope] = summary[:reducer_result]

        qtexts[q_name] = find_first_question_text(parsed_questions, q_name)
      end

      # Replace question names in question list to make the UI happy
      # Example: overall_success_<hash_string> -> overall_success_<index_number>
      #          teacher_engagement_<hash_string> -> teacher_engagement_<index_number>
      qname_replacements = {}   # qname => q_new_name
      qcategory_counts = {}     # qcategory => count
      QUESTION_CATEGORIES.each do |qcategory|
        qtexts.each_pair do |q_name, _|
          next unless q_name.start_with?(qcategory) && !qname_replacements.key?(q_name)

          qcategory_counts[qcategory] ||= 0
          qname_replacements[q_name] = "#{qcategory}_#{qcategory_counts[qcategory]}"

          qcategory_counts[qcategory] += 1
        end
        qtexts.transform_keys! {|k| qname_replacements[k] || k}
      end

      # Replace question names in score list
      ws_scores[fac_name].transform_keys! {|k| qname_replacements[k] || k}

      # Calculate category averages
      question_scores = ws_scores[fac_name]
      QUESTION_CATEGORIES.each do |category_name|
        qnames_in_cateogry = qname_replacements.values.select {|val| val.start_with? category_name}

        category_scores = question_scores.values_at(*qnames_in_cateogry).compact
        this_workshop_scores = category_scores.pluck(:this_workshop)
        all_workshop_scores = category_scores.pluck(:all_my_workshops)

        question_scores[category_name] ||= {}
        question_scores[category_name][:this_workshop] =
          (this_workshop_scores.sum * 1.0 / this_workshop_scores.length).round(2)
        question_scores[category_name][:all_my_workshops] =
          (all_workshop_scores.sum * 1.0 / all_workshop_scores.length).round(2)
      end

      ws_scores[:questions] = qtexts

      {decorated_summaries: result}
    end
  end
end
