module Pd::SurveyPipeline
  class SurveyRollupDecorator
    def self.decorate_facilitator_rollup(data)
      report = {
        facilitators: {},
        current_workshop: data[:current_workshop_id],
        related_workshops: {},
        facilitator_response_counts: {},
        facilitator_averages: {},
        errors: data[:errors]
      }

      # facilitators: {factilitator_id => facilitator_name}
      facilitator_id = data[:facilitator_id]
      facilitator_name = get_user_name_by_id(facilitator_id)
      report[:facilitators][facilitator_id] = facilitator_name

      # related_workshops: {facilitator_name => Array<Integer>}
      report[:related_workshops][facilitator_name] = data[:related_workshop_ids]

      # facilitator_response_counts:
      #   {:this_workshop, :all_my_workshops => {factilitator_id => {submission_type => count}}}
      # TODO: count only submissions that contribute to average scores
      submissions = data[:facilitator_submissions] || data[:workshop_submissions]
      report[:facilitator_response_counts] =
        get_submission_counts submissions, data[:facilitator_id], data[:current_workshop_id]

      # Convert question names to the format that the view expects.
      # There is a difference in how we name sub-questions in the controller and in the (legacy) view.
      # In the controller, sub-question names have <original_question>_<hash_of_sub_question_text> format.
      # While in the view, it expects question names in format <original_question>_<index_of_sub_question>.
      # Conversion examples:
      # overall_success_<hash_string> -> overall_success_<index_number>
      # teacher_engagement_<hash_string> -> teacher_engagement_<index_number>
      # facilitator_effectiveness_<hash_string> -> facilitator_effectiveness__<index_number>
      q_name_replacements =
        get_question_name_replacements data[:parsed_questions], data[:question_categories]

      # Get list of questions to calculate averages.
      # Replace question names if needed.
      # facilitator_averages: {:questions => {question_name => question_text}}
      q_names_to_texts = map_question_name_to_text data[:parsed_questions]
      q_names_to_texts.transform_keys! {|q_name| q_name_replacements[q_name] || q_name}
      # TODO: remove hidden questions and all questions that are not in summaries
      report[:facilitator_averages][:questions] = q_names_to_texts

      # Calculate question averages.
      # Replace question names if needed.
      # facilitator_averages:
      #   {facilitator_name => {question_name => {:this_workshop, :all_my_workshops => score}}}
      question_averages = get_question_averages(data[:summaries], data[:current_workshop_id])
      question_averages.transform_keys! {|q_name| q_name_replacements[q_name] || q_name}
      report[:facilitator_averages][facilitator_name] = question_averages

      # Calculate category averages.
      # facilitator_averages:
      #   {facilitator_name => {question_category => {:this_workshop, :all_my_workshops => score}}}
      category_averages = get_category_averages data[:question_categories], question_averages
      report[:facilitator_averages][facilitator_name].merge! category_averages

      report
    end

    private_class_method

    def self.get_category_averages(question_categories, question_averages)
      result = {}
      question_categories.each do |category|
        # qnames_in_cateogry = qname_replacements.values.select {|val| val.start_with? category}
        # category_scores = avg_scores[facilitator_name].values_at(*qnames_in_cateogry).compact
        # this_workshop_scores = category_scores.pluck(:this_workshop).compact
        # all_workshop_scores = category_scores.pluck(:all_my_workshops).compact

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

    def self.get_question_averages(summaries, current_workshop_id)
      result = {}

      summaries.each do |summary|
        # Acceptable values for workshop_id is either nil or current_workshop_id
        next if summary[:workshop_id] && summary[:workshop_id] != current_workshop_id
        scope = summary[:workshop_id] ? :this_workshop : :all_my_workshops

        q_name = summary[:name]
        result[q_name] ||= {}
        result[q_name][scope] = summary[:reducer_result]
      end

      result
    end

    def self.map_question_name_to_text(parsed_questions)
      # Create mappings from question name to question text for all parsed questions
      q_names_to_texts = {}
      parsed_questions&.each_pair do |_, form_questions|
        form_questions.each_pair do |_, q_content|
          # If there are multiple questions with the same name, we assume they are all the same
          # and keep the first one we find.
          q_names_to_texts[q_content[:name]] = q_content[:text] unless
            q_names_to_texts.key?(q_content[:name])
        end
      end

      q_names_to_texts
    end

    def self.get_question_names(parsed_questions)
      q_names = Set[]

      parsed_questions&.each_pair do |_, form_questions|
        form_questions.each_pair do |_, q_content|
          q_names.add(q_content[:name])
        end
      end

      q_names.to_a
    end

    def self.get_question_name_replacements(parsed_questions, question_categories)
      q_names = get_question_names parsed_questions

      # Create replacements for questions in selected categories
      q_name_replacements = {}
      question_categories.each do |category|
        # Sort names so order of questions in a category is always consistent
        sorted_q_names = q_names.select {|q_name| q_name.start_with?(category)}.sort

        sorted_q_names.each_with_index do |q_name, index|
          q_name_replacements[q_name] = "#{category}_#{index}"
        end
      end

      q_name_replacements
    end

    def self.get_submission_counts(submissions, facilitator_id, current_workshop_id)
      result = {this_workshop: {facilitator_id => {}}, all_my_workshops: {facilitator_id => {}}}

      if submissions.present?
        submission_type =
          submissions.first.is_a?(Pd::WorkshopDailySurvey) ? 'Workshop surveys' : 'Facilitator surveys'

        result[:all_my_workshops][facilitator_id] = {submission_type => submissions.count}
        result[:this_workshop][facilitator_id] =
          {submission_type => submissions.where(pd_workshop_id: current_workshop_id).count}
      end

      result
    end

    def self.get_user_name_by_id(id)
      User.find(id)&.name || "UserId_#{id}"
    end
  end
end
