module Pd::SurveyPipeline
  class SurveyRollupDecorator < SurveyPipelineWorker
    def self.process_data(context)
      check_required_input_keys self::INPUT_KEYS, context

      results = decorate(*context.values_at(*self::INPUT_KEYS))

      self::OUTPUT_KEYS.each do |key|
        context[key] ||= {}
        context[key].deep_merge! results[key]
      end

      context
    end

    def self.decorate(summaries, facilitator_id, current_workshop_id, related_workshop_ids,
      submissions, submission_type, parsed_questions, question_categories, errors = [])
      result = {
        facilitators: {},
        current_workshop: current_workshop_id,
        related_workshops: {},
        facilitator_response_counts: {this_workshop: {}, all_my_workshops: {}},
        facilitator_averages: {},
        errors: errors
      }

      # Populate result[:facilitators] = {factilitator_id => facilitator_name}
      facilitator_name = User.find(facilitator_id)&.name || "UserId_#{facilitator_id}"
      result[:facilitators][facilitator_id] = facilitator_name

      # Populate related workshops
      result[:related_workshops][facilitator_name] = related_workshop_ids

      # Populate result[:facilitator_response_counts] =
      # {this_workshop, all_my_workshops => {factilitator_id => {submission_type => count}}}
      result[:facilitator_response_counts][:all_my_workshops][facilitator_id] =
        {submission_type => submissions.count}
      result[:facilitator_response_counts][:this_workshop][facilitator_id] =
        {submission_type => submissions.where(pd_workshop_id: current_workshop_id).count}

      # Populate result[:facilitator_averages]
      # result[:facilitator_averages][facilitator_name][qname] = {this_workshop, all_my_workshops => score}
      # result[:facilitator_averages][:questions] = {qname => qtext}
      avg_scores = result[:facilitator_averages]
      avg_scores[facilitator_name] = {}

      qtexts = {}   # {qname => text}
      summaries.each do |summary|
        scope =
          if summary[:workshop_id] == current_workshop_id
            :this_workshop
          elsif !summary[:workshop_id]
            :all_my_workshops
          else
            :wrong_scope  # TODO: add non-fatal error
          end
        next if scope == :wrong_scope

        qname = summary[:name]
        avg_scores[facilitator_name][qname] ||= {}
        avg_scores[facilitator_name][qname][scope] = summary[:reducer_result]

        qtexts[qname] = find_first_question_text(parsed_questions, qname) unless
          qtexts.key?(qname)
      end

      # Map current question name to new names which follow a format that the client expects.
      # Examples:
      # overall_success_<hash_string> -> overall_success_<index_number>
      # teacher_engagement_<hash_string> -> teacher_engagement_<index_number>
      qname_replacements = {}   # qname => q_new_name
      qcategory_counts = {}     # qcategory => count
      question_categories.each do |qcategory|
        qtexts.each_pair do |qname, _|
          next unless qname.start_with?(qcategory) && !qname_replacements.key?(qname)

          qcategory_counts[qcategory] ||= 0
          qname_replacements[qname] = "#{qcategory}_#{qcategory_counts[qcategory]}"

          qcategory_counts[qcategory] += 1
        end
      end

      # Replace question names in question list and score list
      qtexts.transform_keys! {|k| qname_replacements[k] || k}
      avg_scores[facilitator_name].transform_keys! {|k| qname_replacements[k] || k}

      # Calculate category averages
      # result[:facilitator_averages][facilitator_name][qcategory] = {this_workshop, all_my_workshops => score}
      question_categories.each do |category_name|
        qnames_in_cateogry = qname_replacements.values.select {|val| val.start_with? category_name}

        category_scores = avg_scores[facilitator_name].values_at(*qnames_in_cateogry).compact
        this_workshop_scores = category_scores.pluck(:this_workshop).compact
        all_workshop_scores = category_scores.pluck(:all_my_workshops).compact

        avg_scores[facilitator_name][category_name] ||= {}
        avg_scores[facilitator_name][category_name][:this_workshop] =
          (this_workshop_scores.sum * 1.0 / this_workshop_scores.length).round(2)
        avg_scores[facilitator_name][category_name][:all_my_workshops] =
          (all_workshop_scores.sum * 1.0 / all_workshop_scores.length).round(2)
      end

      avg_scores[:questions] = qtexts

      {decorated_summaries: result}
    end

    def self.find_first_question_text(parsed_questions, qname)
      parsed_questions&.each_pair do |_, form_questions|
        form_questions.each_pair do |_, qcontent|
          if qcontent[:name] == qname
            return qcontent[:text]
          end
        end
      end
    end
  end

  class FacilitatorSurveyRollupDecorator < SurveyRollupDecorator
    INPUT_KEYS = [
      :summaries, :facilitator_id, :current_workshop_id, :related_workshop_ids,
      :facilitator_submissions, :submission_type, :parsed_questions, :question_categories, :errors
    ]
    OUTPUT_KEYS = [:decorated_summaries]
  end

  class WorkshopSurveyRollupDecorator < SurveyRollupDecorator
    INPUT_KEYS = [
      :summaries, :facilitator_id, :current_workshop_id, :related_workshop_ids,
      :workshop_submissions, :submission_type, :parsed_questions, :question_categories, :errors
    ]
    OUTPUT_KEYS = [:decorated_summaries]
  end
end
