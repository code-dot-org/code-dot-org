# This decorator combines pieces of survey roll-up data from previous steps of the survey pipeline
# and organize them in a format that the client view can consume.

module Pd::SurveyPipeline
  class SurveyRollupDecorator
    # Create roll-up report to send to client view.
    #
    # @param [Hash] data a hash contains pieces of information from previous steps in the pipeline.
    #
    # @return [Hash] a hash report contains following keys
    #   :facilitators => {factilitator_id => facilitator_name}
    #   :current_workshop => Integer
    #   :related_workshops: {facilitator_id => Array<Integer>}
    #   :facilitator_averages => a hash with following keys
    #     :questions => {question_name => question_text}
    #     facilitator_name => {question_name_or_category => {workshop_scope => score}}
    #   :facilitator_response_counts =>
    #     {workshop_scope => {factilitator_id => {submission_type => count}}}
    #   :errors => Array
    #
    def self.decorate_facilitator_rollup(data)
      report = {
        facilitators: {},
        current_workshop: data[:current_workshop_id],
        related_workshops: {},
        facilitator_averages: {},
        facilitator_response_counts: {},
        errors: data[:errors]
      }

      # Get facilitator name and related workshops
      facilitator_id = data[:facilitator_id]
      facilitator_name = get_user_name_by_id(facilitator_id)
      report[:facilitators][facilitator_id] = facilitator_name
      report[:related_workshops][facilitator_id] = data[:related_workshop_ids]

      # Get all questions in the selected categories, even if not all of them have responses.
      # Then convert question names to the format that the UI expects.
      # E.g. overall_success_<hash_string> -> overall_success_<index_number>.
      category_questions =
        get_category_questions data[:parsed_questions], data[:question_categories]
      q_name_replacements =
        get_question_name_replacements category_questions, data[:question_categories]
      report[:facilitator_averages][:questions] =
        replace_question_name_keys category_questions, q_name_replacements

      # Get question average scores
      question_averages = get_question_averages data[:summaries], data[:current_workshop_id]
      report[:facilitator_averages][facilitator_name] =
        replace_question_name_keys question_averages, q_name_replacements

      # Get category average scores
      category_averages = get_category_averages data[:question_categories], question_averages
      report[:facilitator_averages][facilitator_name].merge! category_averages

      # Count number of submissions contributed to category average scores.
      submission_type =
        data[:facilitator_submissions] ? 'Facilitator-specific submissions' : 'Workshop submissions'

      report[:facilitator_response_counts] = {
        this_workshop: {facilitator_id => {}},
        all_my_workshops: {facilitator_id => {}}
      }
      report[:facilitator_response_counts][:this_workshop][facilitator_id][submission_type] =
        get_submission_counts(
          data[:question_answer_joined], data[:question_categories], data[:current_workshop_id]
        )
      report[:facilitator_response_counts][:all_my_workshops][facilitator_id][submission_type] =
        get_submission_counts data[:question_answer_joined], data[:question_categories]

      report
    end

    private_class_method

    def self.get_user_name_by_id(id)
      User.find(id)&.name || "UserId_#{id}"
    end

    # Get all questions in the selected categories.
    #
    # @param [Hash] parsed_questions {form_id => {question_id => question_content}}
    # @param [Array<String>] categories
    # @return [Hash] {question_name => question_text}.
    #
    def self.get_category_questions(parsed_questions = {}, categories = [])
      result = {}
      parsed_questions&.each_pair do |_, form_questions|
        form_questions.each_pair do |_, q_content|
          q_name = q_content[:name]
          next if result.key? q_name
          next if categories.none? {|category| q_name.start_with? "#{category}_"}

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
    def self.get_question_name_replacements(questions = {}, categories = [])
      q_name_replacements = {}
      categories.each do |category|
        # Sort question names by question texts so order of questions is always in alphabetical order.
        sorted_q_names = questions.
          select {|q_name, _| q_name.start_with? "#{category}_"}.
          sort_by {|_, q_text| q_text}.
          pluck(0)

        sorted_q_names.each_with_index do |q_name, index|
          q_name_replacements[q_name] = "#{category}_#{index}"
        end
      end

      q_name_replacements
    end

    # Replace keys of an input hash which uses question names as keys.
    #
    # @param [Hash<question_name, some_value>] question_hash
    # @param [Hash<old_name, new_name>] q_name_replacements
    # @return [Hash] a new hash with the same values as the original input hash
    #   but with the keys replaced.
    #
    def self.replace_question_name_keys(question_hash = {}, q_name_replacements = {})
      question_hash.
        select {|q_name, _| q_name_replacements.key? q_name}.
        transform_keys {|q_name| q_name_replacements[q_name]}
    end

    # Get question average scores for a specific workshop and for all workshops.
    #
    # @param [Array<Hash>] summaries
    # @param [Integer] workshop_id
    # @return [Hash] {question_name => {workshop_scope => avg_score}}]
    #
    def self.get_question_averages(summaries = [], workshop_id)
      result = {}

      summaries.each do |summary|
        # Acceptable workshop id value is either nil or the specified workshop_id
        next if summary[:workshop_id] && summary[:workshop_id] != workshop_id

        scope = summary[:workshop_id] ? :this_workshop : :all_my_workshops
        q_name = summary[:name]
        result[q_name] ||= {}
        result[q_name][scope] = summary[:reducer_result].round(2)
      end

      result
    end

    # Get average results of all questions in the same category.
    #
    # @param [Array<String>] categories category names
    # @param [Hash] question_averages {question_name => {workshop_scope => avg_score}}
    # @return [Hash] {category_name => {workshop_scope => avg_score}}
    #
    def self.get_category_averages(categories = [], question_averages = {})
      result = {}
      categories.each do |category|
        category_scores = question_averages.select {|q_name, _| q_name.start_with? "#{category}_"}
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

    # Count number of unique submissions that have answers for any question in
    # the selected categories.
    #
    # @param [Hash] question_with_answers combination of questions and answers
    # @param [Array<String>] categories category names
    # @param [Integer] workshop_id limit counting to a specific workshop
    # @return [Integer] submission count
    #
    def self.get_submission_counts(question_with_answers = [], categories = [], workshop_id = nil)
      submissions_ids = Set[]
      question_with_answers.each do |qa|
        next if workshop_id && qa[:workshop_id] != workshop_id
        next if qa[:answer].blank?
        next unless categories.any? {|category| qa[:name].start_with? "#{category}_"}

        submissions_ids.add qa[:submission_id]
      end

      submissions_ids.length
    end
  end
end
