class Api::V1::AssessmentsController < Api::V1::JsonApiController
  include LevelsHelper
  load_and_authorize_resource :section
  load_and_authorize_resource :script

  # For each assessment in a script, return an object of script_level IDs to question data.
  # Question data includes the question text, all possible answers, and the correct answers.
  # Example output:
  # {
  #   2345: {   #a level id associated with an assessment
  #     id: 2345,
  #     name: "Assessment for Chapter 1",
  #     questions: {123: {type: "Multi", question_text: "A question", answers: [{text: "answer1", correct: true}] }}
  #   }
  #   ..other assessment ids
  # }
  #
  # GET '/dashboardapi/assessments'
  # TODO(caleybrock): currently only used in internal experiment, must add controller tests.
  def index
    # Only authorized teachers have access to locked question and answer data.
    render status: :forbidden unless current_user.authorized_teacher?

    level_group_script_levels = @script.script_levels.includes(:levels).where('levels.type' => 'LevelGroup')

    assessments = {}

    level_group_script_levels.map do |script_level|
      next unless script_level.long_assessment?

      # Don't allow somebody to peek inside an anonymous survey using this API.
      next if script_level.anonymous?

      # The actual level group that corresponds to the script_level
      level_group = script_level.levels[0]

      # An array to store the individual level structure in the level_group
      # Order matters for the questions
      questions = []

      # For each level in the multi group (ignore pages structure information)
      level_group.levels.each do |level|
        # A single level corresponds to a single question
        questions.push(level.question_summary)
      end

      assessments[level_group.id] = {
        id: level_group.id,
        questions: questions,
        name: level_group.name,
      }
    end

    render json: assessments
  end

  # Return a hash by student_id for all students in a section. The value is a hash by
  # script_level_id, with information on the student responses for that assessment.
  # Currently, very similar logic to section_assessments, but will change as we refactor. The format
  # of the results is different enough that I'm duplicating some code it for now.
  # Example output:
  # {
  #   12: {   <--- a student id
  #     student_name: "caley",
  #     responses: {
  #      4593: <---- a script id referring to an assessment
  #        {level_results: [{status: "correct", answer: "A"}], multi_correct: 5, multi_count: 10.......}
  #     ...other assessments
  #   }
  #   ..student ids
  # }
  #
  # GET '/dashboardapi/assessments/section_responses'
  # TODO(caleybrock): currently only used in internal experiment, must add controller tests.
  def section_responses
    responses_by_student = {}

    level_group_script_levels = @script.script_levels.includes(:levels).where('levels.type' => 'LevelGroup')

    @section.students.each do |student|
      # Initialize student hash
      student_hash = {
        student_name: student.name
      }
      responses_by_level_group = {}

      level_group_script_levels.each do |script_level|
        next unless script_level.long_assessment?

        # Don't allow somebody to peek inside an anonymous survey using this API.
        next if script_level.anonymous?

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

        # And construct a listing of all the individual levels and their results.
        level_results = []

        level_group.levels.each do |level|
          if level.is_a? Multi
            multi_count += 1
          end

          level_response = response_parsed[level.id.to_s]

          level_result = {}

          if level_response
            case level
            when TextMatch, FreeResponse
              student_result = level_response["result"]
              level_result[:student_result] = student_result
              level_result[:status] = "free_response"
            when Multi
              answer_indexes = Multi.find_by_id(level.id).correct_answer_indexes
              student_result = level_response["result"].split(",").sort.join(",")

              # Convert "0,1,3" to "A, B, D" for teacher-friendly viewing
              level_result[:student_result] = student_result.split(',').map {|k| Multi.value_to_letter(k.to_i)}.join(', ')

              if student_result == "-1"
                level_result[:student_result] = ""
                level_result[:status] = "unsubmitted"
              elsif student_result == answer_indexes
                multi_count_correct += 1
                level_result[:status] = "correct"
              else
                level_result[:status] = "incorrect"
              end
            end
          else
            level_result[:status] = "unsubmitted"
          end

          level_results << level_result
        end

        submitted = last_attempt[:submitted]
        timestamp = last_attempt[:updated_at].to_formatted_s

        responses_by_level_group[level_group.id] = {
          stage: script_level.stage.localized_title,
          puzzle: script_level.position,
          question: level_group.properties["title"],
          url: build_script_level_url(script_level, section_id: @section.id, user_id: student.id),
          multi_correct: multi_count_correct,
          multi_count: multi_count,
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
end
