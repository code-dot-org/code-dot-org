module Pd::WorkshopSurveyResultsHelper
  # The output is a hash where
  # - Multiple choice answers (aka scored answers) that are not facilitator specific turn
  #   into an average of all responses
  # - Free responses that are not facilitator specific turn into an array of all responses
  # - Multiple choice answers that are facilitator specific turn into:
  #   A hash of facilitators and the average of their scores if no facilitator specified
  #   OR The average of all responses for one facilitator if facilitator specified
  # - Free response answers that are facilitator specific turn into:
  #   A hash of facilitators and a list of all their answers
  #   OR A list of all responses for one facilitator if facilitator specified
  #
  # @param workshops List of Workshops to aggregate surveys
  # @param facilitator_name Facilitator name to restrict responses for
  # @param facilitator_breakdown Whether to have a facilitator breakdown
  # @returns Hash representing an average of all the respones, or array of free text responses
  def summarize_workshop_surveys(workshops:, facilitator_name: nil, facilitator_breakdown: true)
    # Works on arrays where everything is either a teachercon survey or workshop survey
    # (but not both)
    surveys = workshops.flat_map(&:survey_responses)

    raise 'Currently just summarizes Local Summer and Teachercon surveys' unless
      surveys.all? {|survey| survey.is_a? Pd::TeacherconSurvey} ||
        surveys.all? {|survey| survey.is_a? Pd::LocalSummerWorkshopSurvey}

    return Hash.new if surveys.empty?

    questions = surveys.first.class.options
    facilitator_specific_options = surveys.first.class.facilitator_required_fields

    # Hash representing overall score sums
    sum_hash = Hash.new(0)
    responses_per_facilitator = Hash.new(0)

    # Ugly branchy way to compute the summarization for the user
    surveys.each do |response|
      response_hash = facilitator_name ?
                        response.generate_summary_for_facilitator(facilitator_name) :
                        response.sanitize_form_data_hash

      response_hash[:who_facilitated].each {|name| responses_per_facilitator[name] += 1}

      response_hash.each do |k, v|
        # Multiple choice questions
        if questions.key? k
          if v.is_a? Hash
            if facilitator_breakdown
              # Multiple choice answers for each facilitator
              sum_hash[k] = Hash.new(0) if sum_hash[k] == 0

              v.each do |name, answer|
                sum_hash[k][name] += questions[k].index(answer) + 1
              end
            else
              sum_hash[k] += v.values.map {|value| questions[k].index(value) + 1}.reduce(:+)
            end
          else
            next unless v.presence

            # Multiple choice answer for the workshop as a whole
            sum_hash[k] += questions[k].index(v) + 1
          end
        else
          # The answer is a free response - either specific to the faciliator or in general
          if v.is_a? Hash
            # Hash, indicating facilitator specific free responses
            sum_hash[k] = Hash.new if sum_hash[k] == 0

            v.each do |name, answer|
              if sum_hash[k].key? name
                sum_hash[k][name] << answer
              else
                sum_hash[k][name] = [answer]
              end
            end
          else
            # Free response answers for the workshop as a wholoe
            sum_hash[k] = [] if sum_hash[k] == 0

            sum_hash[k] << v if v.presence
          end
        end
      end
    end

    sum_hash.each do |k, v|
      next unless questions.key? k

      if v.is_a? Integer
        if facilitator_specific_options.include?(k) && facilitator_name && facilitator_breakdown
          # For facilitator specific questions, take the average over all responses for that facilitator
          sum_hash[k] = (v / responses_per_facilitator[facilitator_name].to_f).round(2)
        else
          # For non facilitator specific answers, take the average over all surveys
          sum_hash[k] = (v / surveys.count.to_f).round(2)
        end
      else
        v.each do |name, value|
          sum_hash[k][name] = (value / responses_per_facilitator[name].to_f).round(2)
        end
      end
    end

    sum_hash[:num_enrollments] = workshops.flat_map(&:enrollments).size
    sum_hash[:num_surveys] = surveys.size

    sum_hash
  end
end
