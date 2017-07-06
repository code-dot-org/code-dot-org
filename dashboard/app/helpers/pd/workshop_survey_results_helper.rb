module Pd::WorkshopSurveyResultsHelper
  # Summarize an array of workshop surveys that are of the same type
  # @param surveys List of TeacherconSurveys
  # @param options List of the questions the survey uses.
  # @param facilitator Faciliator to restrict responses for
  # @returns Hash representing an average of all the respones, or array of free text responses
  def summarize_workshop_surveys(surveys, options, facilitator = nil)
    # Works on arrays where everything is either a teachercon survey or workshop survey
    # (but not both)
    raise 'Currently just sumarizes Teachercon surveys' unless
      surveys.all? {|survey| survey.is_a? Pd::TeacherconSurvey}

    # Hash representing overall score sums
    sum_hash = Hash.new(0)

    surveys.each do |response|
      response_hash = response.sanitize_form_data_hash

      response_hash.each do |k, v|
        # Is this a multiple choice question?
        if options.key? k
          sum_hash[k] += options[k].index(v) + 1
        else
          # If not, concat it to the list of responses
          if v.is_a? Hash
            v = v.keep_if {|key, _| key == facilitator} if facilitator

            if sum_hash[k] == 0
              sum_hash[k] = convert_facilitator_hash_to_string(v)
            else
              sum_hash[k].concat convert_facilitator_hash_to_string(v)
            end
          else
            sum_hash[k] == 0 ? sum_hash[k] = [v] : sum_hash[k] << v
          end
        end
      end
    end

    sum_hash.each do |k, v|
      if options.key? k
        sum_hash[k] = v / surveys.count.to_f
      end
    end
  end

  private

  def convert_facilitator_hash_to_string(facilitator_hash)
    facilitator_hash.map {|k, v| "#{k}: #{v}"}
  end
end
