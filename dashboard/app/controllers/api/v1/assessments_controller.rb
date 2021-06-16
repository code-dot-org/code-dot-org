class Api::V1::AssessmentsController < Api::V1::JsonApiController
  include LevelsHelper

  before_action :load_from_cache
  load_and_authorize_resource :section, only: [:section_responses, :section_surveys, :section_feedback]
  load_and_authorize_resource :script

  def load_from_cache
    @unit = Script.get_from_cache(params[:script_id])
  end

  # For each assessment in a script, return an object of script_level IDs to question data.
  # Question data includes the question text, all possible answers, and the correct answers.
  # Example output:
  # {
  #   2345: {   #a level_group id associated with an assessment
  #     id: 2345,
  #     name: "Assessment for Chapter 1",
  #     questions: {123: {type: "Multi", question_text: "A question", answers: [{text: "answer1", correct: true}] }}
  #   }
  #   ..other assessment ids
  # }
  #
  # GET '/dashboardapi/assessments'
  def index
    # Only authorized teachers have access to locked question and answer data.
    render status: :forbidden unless current_user&.authorized_teacher?

    assessment_script_levels = @script.get_assessment_script_levels

    assessments = {}

    assessment_script_levels.map do |script_level|
      # The actual level group that corresponds to the script_level
      level_group = script_level.levels[0]

      # An array to store the individual level structure in the level_group
      # Order matters for the questions
      questions = []

      # For each level in the multi group (ignore pages structure information)
      level_group.levels.each_with_index do |level, index|
        # A single level corresponds to a single question
        summary = level.question_summary
        summary[:question_index] = index
        questions.push(summary)
        # Except match has many "questions"
        if level.type == "Match"
          summary[:options] = level.questions
          summary[:question] = level.question
        end
      end

      assessments[level_group.id] = {
        id: level_group.id.to_s,
        questions: questions,
        name: script_level.lesson.localized_title,
      }
    end

    render json: assessments
  end

  # Return a hash by student_id for all students in a section. The value is a hash by
  # script_level_id, with information on the student responses for that assessment.
  # Example output:
  # {
  #   12: {   <--- a student id
  #     student_name: "caley",
  #     responses: {
  #      4593: <---- a level_group id referring to an assessment
  #        {level_results: [{status: "correct", answer: "A"}], multi_correct: 5, multi_count: 10.......}
  #     ...other assessments
  #   }
  #   ..student ids
  # }
  #
  # GET '/dashboardapi/assessments/section_responses'
  def section_responses
    responses_by_student = {}

    assessment_script_levels = @script.get_assessment_script_levels

    @section.students.each do |student|
      # Initialize student hash
      student_hash = {
        student_name: student.name
      }
      responses_by_level_group = {}

      assessment_script_levels.each do |script_level|
        # Get the UserLevel for the last attempt.  This approach does not check
        # for the script and so it'll find the student's attempt at this level for
        # any script in which they have encountered that level.
        last_attempt = student.last_attempt_for_any(script_level.levels)

        # Get the LevelGroup itself.
        level_group = last_attempt.try(:level) || script_level.oldest_active_level

        # Get the response which will be stringified JSON.
        response = last_attempt.try(:level_source).try(:data)

        next unless response

        # Parse the response string into an object.
        response_parsed = JSON.parse(response)

        # Summarize some key data.
        multi_count = 0
        multi_count_correct = 0
        match_count = 0
        match_count_correct = 0

        # And construct a listing of all the individual levels and their results.
        level_results = []

        level_group.levels.each do |level|
          if level.is_a? Multi
            multi_count += 1
          elsif level.is_a? Match
            match_count += 1
          end

          level_response = response_parsed[level.id.to_s]

          level_result = {}

          case level
          when TextMatch, FreeResponse
            level_result[:type] = "FreeResponse"
          when Multi
            level_result[:type] = "Multi"
          when Match
            level_result[:type] = "Match"
          end

          if level_response
            case level
            when TextMatch, FreeResponse
              student_result = level_response["result"]
              level_result[:student_result] = student_result
              level_result[:status] = ""
            when Multi
              answer_indexes = Multi.find_by_id(level.id).correct_answer_indexes_array
              student_result = level_response["result"].split(",").map(&:to_i).sort
              level_result[:student_result] = student_result

              if student_result == [-1]
                level_result[:student_result] = []
                level_result[:status] = "unsubmitted"
              # Deep comparison of arrays of indexes
              elsif student_result.present? && student_result - answer_indexes == [] && answer_indexes.length == student_result.length
                multi_count_correct += 1
                level_result[:status] = "correct"
              else
                level_result[:status] = "incorrect"
              end
            when Match
              student_result = level_response["result"].split(",", -1)
              # If a student did not answer some of the matching question we will record that as nil
              student_result = student_result.map do |result|
                result.empty? ? nil : result.to_i
              end
              level_result[:student_result] = student_result
              option_status = []
              number_correct = 0
              student_result.each_with_index do |answer, index|
                if answer.nil?
                  option_status[index] = "unsubmitted"
                else
                  option_status[index] = "submitted"
                  if answer == index
                    number_correct += 1
                  end
                end
              end
              if number_correct == student_result.length
                match_count_correct += 1
              end
              level_result[:status] = option_status
            end
          else
            level_result[:status] = "unsubmitted"
          end

          level_results << level_result
        end

        submitted = last_attempt[:submitted]
        timestamp = last_attempt[:updated_at].to_datetime

        responses_by_level_group[level_group.id] = {
          lesson: script_level.lesson.localized_title,
          puzzle: script_level.position,
          question: level_group.properties["title"],
          url: build_script_level_url(script_level, section_id: @section.id, user_id: student.id),
          multi_correct: multi_count_correct,
          multi_count: multi_count,
          match_correct: match_count_correct,
          match_count: match_count,
          submitted: submitted,
          timestamp: timestamp,
          level_results: level_results
        }
      end

      # If a student has made responses, add them to the hash
      if responses_by_level_group.keys.count > 0
        student_hash[:responses_by_assessment] = responses_by_level_group
        responses_by_student[student.id] = student_hash
      end
    end

    render json: responses_by_student
  end

  # Return results for surveys, which are long-assessment LevelGroup levels with the anonymous property.
  # At least five students in the section must have submitted answers.  The answers for each contained
  # sublevel are shuffled randomly.
  # GET '/dashboardapi/assessments/section_surveys'
  def section_surveys
    render json: LevelGroup.get_summarized_survey_results(@script, @section)
  end

  def section_feedback
    render json: @script.get_feedback_for_section(@section)
  end
end
