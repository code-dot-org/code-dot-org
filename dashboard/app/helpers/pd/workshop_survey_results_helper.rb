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
  # @param surveys List of TeacherconSurveys or LocalWorkshopSurveys
  # @param facilitator Facilitator name to restrict responses for
  # @returns Hash representing an average of all the respones, or array of free text responses
  def summarize_workshop_surveys(surveys, facilitator = nil)
    # Works on arrays where everything is either a teachercon survey or workshop survey
    # (but not both)
    raise 'Currently just sumarizes Teachercon surveys' unless
      surveys.all? {|survey| survey.is_a? Pd::TeacherconSurvey} ||
        surveys.all? {|survey| survey.is_a? Pd::LocalSummerWorkshopSurvey}

    options = surveys.first.class.options
    facilitator_specific_options = surveys.first.class.facilitator_required_fields

    # Hash representing overall score sums
    sum_hash = Hash.new(0)
    responses_per_facilitator = Hash.new(0)

    # Ugly branchy way to compute the summarization for the user
    surveys.each do |response|
      response_hash = facilitator ?
                        response.generate_summary_for_facilitator(facilitator) :
                        response.sanitize_form_data_hash

      response_hash[:who_facilitated].each {|name| responses_per_facilitator[name] += 1}

      response_hash.each do |k, v|
        # Multiple choice questions
        if options.key? k
          if v.is_a? Hash
            # Multiple choice answers for each facilitator
            sum_hash[k] = Hash.new(0) if sum_hash[k] == 0

            v.each do |facilitator_name, answer|
              sum_hash[k][facilitator_name] += options[k].index(answer) + 1
            end
          else
            next unless v.presence

            # Multiple choice answer for the workshop as a whole
            sum_hash[k] += options[k].index(v) + 1
          end
        else
          # The answer is a free response - either specific to the faciliator or in general
          if v.is_a? Hash
            # Hash, indicating facilitator specific free responses
            sum_hash[k] = Hash.new if sum_hash[k] == 0

            v.each do |facilitator_name, answer|
              if sum_hash[k].key? facilitator_name
                sum_hash[k][facilitator_name] << answer
              else
                sum_hash[k][facilitator_name] = [answer]
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
      next unless options.key? k

      if v.is_a? Integer
        if facilitator_specific_options.include?(k) && facilitator
          # For facilitator specific questions, take the average over all respones for that faciliator
          sum_hash[k] = v / responses_per_facilitator[facilitator].to_f
        else
          # For non facilitator specific answers, take the average over all surveys
          sum_hash[k] = v / surveys.count.to_f
        end
      else
        v.each do |facilitator_name, value|
          sum_hash[k][facilitator_name] = value / responses_per_facilitator[facilitator_name].to_f
        end
      end
    end
  end

  private

  def convert_facilitator_hash_to_string(facilitator_hash)
    facilitator_hash.map {|k, v| "#{k}: #{v}"}
  end
end
