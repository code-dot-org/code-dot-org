module Pd::WorkshopSurveyResultsHelper
  # Summarize an array of workshop surveys that are of the same type
  # @param surveys List of either TeacherconSurveys of LocalSummerWorkshopSurveys
  # @param options List of the questions the survey uses.
  # @returns Hash representing an average of all the respones, or array of free text responses
  def summarize_workshop_surveys(surveys, options)
    # Works on arrays where everything is either a teachercon survey or workshop survey
    # (but not both)
    raise 'Cannot summarize different kinds of workshop surveys' unless
      surveys.all? {|survey| survey.is_a? Pd::TeacherconSurvey} ||
      surveys.all? {|survey| survey.is_a? Pd::LocalSummerWorkshopSurvey}

    # Hash representing overall score sums
    sum_hash = Hash.new(0)

    surveys.each do |response|
      response_hash = JSON.parse(response.form_data).transform_keys {|k| k.underscore.to_sym}

      response_hash.each do |k, v|
        # Is this a multiple choice question?
        if options.key? k
          sum_hash[k] += options[k].index(v) + 1
        else
          # If not, concat it to the list of responses
          sum_hash[k] == 0 ? sum_hash[k] = [v] : sum_hash[k] << v
        end
      end
    end

    sum_hash.each do |k, v|
      if options.key? k
        sum_hash[k] = v / surveys.count.to_f
      end
    end
  end
end
