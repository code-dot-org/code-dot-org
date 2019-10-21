# SurveyRollupDecorator combines pieces of survey roll-up data from previous steps
# of the survey pipeline and organize them in a format that the client view can consume.

module Pd::SurveyPipeline
  class SurveyRollupDecorator
    # Create roll-up report to send to client.
    #
    # Return value is a Hash with following keys
    # :rollups [Hash<scenario_name, scenario_content>]. scenario_content is a Hash with these keys
    #   :averages [Hash<question_name, Float>]
    #   :response_count [Integer]
    #   :facilitator_id [Integer]
    #   :workshop_id [Integer]
    #   :all_workshop_ids [Array<Integer>]
    #   :course_name [String]
    # :questions [Hash<question_name, question_text>]
    # :facilitators [Hash<facilitator_id, facilitator_name>]
    #
    # @param data [Hash]
    # @option data [Integer] :facilitator_id a facilitator in the current workshop
    # @option data [Integer] :current_workshop_id the main workshop user is requesting survey results for
    # @option data [Array<Integer>] :related_workshop_ids workshops related to the current workshop and the selected facilitator
    # @option data [Hash] :parsed_questions questions parsed from Pd::SurveyQuestion
    # @option data [Array<String>] :question_categories categories for roll-up results
    # @option data [Array<Hash>] :question_answer_joined questions & answers joined together
    # @option data [Array<Hash>] :summaries survey result summaries
    # @param only_facilitator_questions [Boolean]
    # @return [Hash]
    #
    def self.decorate_facilitator_rollup(data, only_facilitator_questions)
      report = {
        rollups: {},
        questions: {},
        facilitators: {}
      }

      facilitator_id = data[:facilitator_id]
      report[:facilitators][facilitator_id] = get_user_name_by_id(facilitator_id)

      report[:questions] =
        get_category_questions data[:parsed_questions], data[:question_categories]

      # For single workshop scenario (survey results come from one workshop), we only add
      # facilitator id to scenario name if questions are facilitator-specific.
      # (There are 2 type of questions, facilitator-specific and general workshop questions.)
      single_ws_scenario =
        only_facilitator_questions ? "facilitator_#{facilitator_id}_single_ws" : "single_ws"

      report[:rollups][single_ws_scenario] = {
        averages: get_averages_single_ws(data),
        response_count: get_submission_count_single_ws(data),
        workshop_id: data[:current_workshop_id]
      }
      report[:rollups][single_ws_scenario][:facilitator_id] = facilitator_id if only_facilitator_questions

      # For scenario that collects survey results from multiple related workshops, it is always
      # facilitator-specific because each facilitator has different set of related workshops.
      # Thus, no matter what the question type is, we always add facilitator id to the scenario name.
      all_ws_scenario = "facilitator_#{facilitator_id}_all_ws"

      report[:rollups][all_ws_scenario] = {
        averages: get_averages_all_ws(data),
        response_count: get_submission_count_all_ws(data),
        facilitator_id: facilitator_id,
        all_workshop_ids: data[:related_workshop_ids],
        course_name: Pd::Workshop.find(data[:current_workshop_id]).course
      }

      report
    end

    # TODO: make these class methods private
    def self.get_submission_count_single_ws(data)
      get_submission_count(
        data[:question_answer_joined], data[:question_categories], data[:current_workshop_id]
      )
    end

    def self.get_submission_count_all_ws(data)
      get_submission_count data[:question_answer_joined], data[:question_categories]
    end

    def self.get_averages_single_ws(data)
      question_averages = get_question_averages data[:summaries], data[:current_workshop_id]
      category_averages = get_category_averages data[:question_categories], question_averages
      question_averages.merge(category_averages)
    end

    def self.get_averages_all_ws(data)
      question_averages = get_question_averages data[:summaries]
      category_averages = get_category_averages data[:question_categories], question_averages
      question_averages.merge(category_averages)
    end

    # @note Copied from SurveyRollupDecorator.get_user_name_by_id
    def self.get_user_name_by_id(id)
      User.find(id)&.name || "UserId_#{id}"
    end

    # Get all questions in the selected categories.
    # @note Copied from SurveyRollupDecorator.get_category_questions
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

    # Count number of unique submissions that have answers for any question in
    # the selected categories.
    # @note Modified from SurveyRollupDecorator.get_submission_counts
    #
    # @param [Hash] question_with_answers combination of questions and answers
    # @param [Array<String>] categories category names
    # @param [Integer] workshop_id limit counting to a specific workshop
    # @return [Integer] submission count
    #
    def self.get_submission_count(question_with_answers = [], categories = [], workshop_id = nil)
      submissions_ids = Set[]
      question_with_answers.each do |qa|
        next if workshop_id && qa[:workshop_id] != workshop_id
        next if qa[:answer].blank?
        next unless categories.any? {|category| qa[:name].start_with? "#{category}_"}

        submissions_ids.add qa[:submission_id]
      end

      submissions_ids.length
    end

    # Get question average scores for selected workshop_id value.
    # @note Modified from SurveyRollupDecorator.get_question_averages
    #
    # @param [Array<Hash>] summaries
    # @param [Integer] workshop_id
    # @return [Hash] {question_name => avg_score}]
    #
    def self.get_question_averages(summaries = [], workshop_id = nil)
      {}.tap do |result|
        summaries.each do |summary|
          # Acceptable workshop id value is either nil or the specified workshop_id
          next if summary[:workshop_id] != workshop_id
          result[summary[:name]] = summary[:reducer_result].round(2)
        end
      end
    end

    # Get average results of all questions in the same category.
    # @note Modified from SurveyRollupDecorator.get_category_averages
    #
    # @param [Array<String>] categories category names
    # @param [Hash] question_averages {question_name => avg_score}
    # @return [Hash] {category_name => avg_score}
    #
    def self.get_category_averages(categories = [], question_averages = {})
      {}.tap do |result|
        categories.each do |category|
          category_scores =
            question_averages.select {|q_name, _| q_name.start_with? "#{category}_"}.
              values.compact

          result[category] = category_scores.present? ?
              (category_scores.sum * 1.0 / category_scores.length).round(2) : nil
        end
      end
    end
  end
end
