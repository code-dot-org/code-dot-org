module Pd::SurveyPipeline
  class SurveyRollupDecorator
    # Create a roll up report to send to client view.
    #
    # @param [Hash] data a hash contains all important pieces of information from
    #   previous steps in the pipeline.
    #
    # @return [Hash] a hash report contains following keys
    #   :facilitators => {factilitator_id => facilitator_name}
    #   :current_workshop => Integer
    #   :related_workshops: {facilitator_id => Array<Integer>}
    #   :facilitator_response_counts =>
    #     {workshop_scope => {factilitator_id => {submission_type => count}}}
    #   :facilitator_averages => a hash with following keys
    #     :questions => {question_name => question_text}
    #     facilitator_name => {question_name_or_category => {workshop_scope => score}}
    #   :errors => Array
    #
    def self.decorate_facilitator_rollup(data)
      report = {
        facilitators: {},
        current_workshop: data[:current_workshop_id],
        related_workshops: {},
        facilitator_response_counts: {},
        facilitator_averages: {},
        errors: data[:errors]
      }

      # Get values for :facilitators and :related_workshops keys
      facilitator_id = data[:facilitator_id]
      facilitator_name = get_user_name_by_id(facilitator_id)
      report[:facilitators][facilitator_id] = facilitator_name
      report[:related_workshops][facilitator_id] = data[:related_workshop_ids]

      # Get value for :facilitator_response_counts key
      # TODO: count only submissions that contribute to average scores
      submissions = data[:facilitator_submissions] || data[:workshop_submissions]
      report[:facilitator_response_counts] =
        get_submission_counts submissions, data[:facilitator_id], data[:current_workshop_id]

      # Get value for :questions key in :facilitator_averages key.
      # The value contains all questions in selected categories, even if not all of them have responses.
      # Also convert question names to the format that the UI expects.
      # E.g. overall_success_<hash_string> -> overall_success_<index_number>.
      category_questions =
        get_category_questions data[:parsed_questions], data[:question_categories]
      q_name_replacements =
        get_question_name_replacements category_questions, data[:question_categories]
      report[:facilitator_averages][:questions] =
        replace_question_name_keys category_questions, q_name_replacements

      # Get question averages for this facilitator in :facilitator_averages key
      # Replace question names if needed.
      question_averages = get_question_averages data[:summaries], data[:current_workshop_id]
      report[:facilitator_averages][facilitator_name] =
        replace_question_name_keys question_averages, q_name_replacements

      # Get category averages for this facilitator in :facilitator_averages key
      category_averages = get_category_averages data[:question_categories], question_averages
      report[:facilitator_averages][facilitator_name].merge! category_averages

      report
    end

    private_class_method

    def self.get_user_name_by_id(id)
      User.find(id)&.name || "UserId_#{id}"
    end

    # Count number of submissions for a specific workshop and for all workshops.
    #
    # @param [Array<Pd::WorkshopDailySurvey|Pd::WorkshopFacilitatorId>] submissions
    # @param [Integer] facilitator_id
    # @param [Integer] workshop_id
    # @return [Hash] {workshop_scope => {facilitator_id => {submission_type => count}}
    #
    def self.get_submission_counts(submissions, facilitator_id, workshop_id)
      result = {this_workshop: {facilitator_id => {}}, all_my_workshops: {facilitator_id => {}}}

      if submissions.present?
        submission_type =
          submissions.first.is_a?(Pd::WorkshopDailySurvey) ? 'Workshop surveys' : 'Facilitator surveys'

        result[:all_my_workshops][facilitator_id] = {submission_type => submissions.count}
        result[:this_workshop][facilitator_id] =
          {submission_type => submissions.where(pd_workshop_id: workshop_id).count}
      end

      result
    end

    # Get all questions in selected categories.
    #
    # @param [Hash{form_id => {question_id => question_content}}] parsed_questions
    # @param [Array<String>] categories
    # @return [Hash] {question_name => question_text}.
    #
    def self.get_category_questions(parsed_questions, categories)
      result = {}
      parsed_questions&.each_pair do |_, form_questions|
        form_questions.each_pair do |_, q_content|
          q_name = q_content[:name]
          next if result.key? q_name
          next if categories.none? {|category| q_name.start_with? category}

          result[q_name] = q_content[:text]
        end
      end

      result
    end

    # Create new names for questions in the selected categories.
    # Old name: <category>_<hash string>. New name: <category>_<index number>.
    #
    # @param [Hash<question_name, question_text>] questions
    # @param [Array<String>] categories
    # @return [Hash] {old_question_name => new_question_name}
    #
    def self.get_question_name_replacements(questions, categories)
      q_name_replacements = {}
      categories.each do |category|
        # Questions in a category could also mean sub-questions of a the same parent question.
        # In that case, we ignore the parent question and also replace names of the sub-questions.
        # Sort question names by question texts so order of questions is always in
        # alphabetical order.
        sorted_q_names = questions.
          select {|q_name, _| q_name.start_with?(category) && q_name != category}.
          sort_by {|_, value| value}.
          pluck(0)

        sorted_q_names.each_with_index do |q_name, index|
          q_name_replacements[q_name] = "#{category}_#{index}"
        end
      end

      q_name_replacements
    end

    # Replace keys for an input hash which uses question names as keys.
    #
    # @param [Hash<question_name, value>] question_hash
    # @param [Hash<old_name, new_name>] q_name_replacements
    # @return [Hash] a new hash with the same values as the original input hash
    #   but with the keys replaced.
    #
    def self.replace_question_name_keys(question_hash, q_name_replacements)
      question_hash.
        select {|q_name, _| q_name_replacements.key? q_name}.
        transform_keys {|q_name| q_name_replacements[q_name]}
    end

    # Get quetion average results for a specific workshop and for all workshops.
    #
    # @param [Array<Hash>] summaries
    # @param [Integer] workshop_id
    # @return [Hash] {question_name => {workshop_scope => avg_result}}]
    #
    def self.get_question_averages(summaries, workshop_id)
      result = {}

      summaries.each do |summary|
        # Acceptable values for workshop_id is either nil or current_workshop_id
        next if summary[:workshop_id] && summary[:workshop_id] != workshop_id

        scope = summary[:workshop_id] ? :this_workshop : :all_my_workshops
        q_name = summary[:name]
        result[q_name] ||= {}
        result[q_name][scope] = summary[:reducer_result]
      end

      result
    end

    # Get average results of all questions in the same category.
    #
    # @param [Array<String>] categories
    # @param [Hash{question_name => {workshop_scope => avg_result}}] question_averages
    # @return [Hash] {category_name => {workshop_scope => avg_result}}
    #
    def self.get_category_averages(categories, question_averages)
      result = {}
      categories.each do |category|
        category_scores = question_averages.select {|q_name, _| q_name.start_with? category}
        this_workshop_scores = category_scores.values.pluck(:this_workshop).compact
        all_workshop_scores = category_scores.values.pluck(:all_my_workshops).compact

        result[category] = {}
        result[category][:this_workshop] =
          (this_workshop_scores.sum * 1.0 / this_workshop_scores.length).round(2)
        result[category][:all_my_workshops] =
          (all_workshop_scores.sum * 1.0 / all_workshop_scores.length).round(2)
      end

      result
    end
  end
end
