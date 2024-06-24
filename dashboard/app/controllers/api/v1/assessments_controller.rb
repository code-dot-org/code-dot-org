class Api::V1::AssessmentsController < Api::V1::JSONApiController
  include LevelsHelper

  before_action :load_from_cache
  load_and_authorize_resource :section, only: [:section_responses, :section_surveys, :section_feedback]
  load_and_authorize_resource :script

  def load_from_cache
    @script = Unit.get_from_cache(params[:script_id])
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
    render status: :forbidden unless current_user&.verified_instructor?

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

    script_id = @script.id
    assessment_script_levels = @script.get_assessment_script_levels

    @section.students.in_batches(of: 20).each do |student_batch|
      # Retrieve progress data (UserLevel + associated LevelSource objects) for all
      # students in this batch.
      progress_data = get_assessment_progress_data(student_batch, script_id, assessment_script_levels)

      student_batch.each do |student|
        responses_by_level_group = {}

        assessment_script_levels.each do |script_level|
          # student_progress is an array of UserLevel objects corresponding to the
          # current student and the level_group and sublevels of the current script_level
          student_progress = progress_data[script_level.id][student.id]
          next unless student_progress

          level_group_id, assessment_response = summarize_assessment_response(student.id, script_level, student_progress)
          responses_by_level_group[level_group_id] = assessment_response unless assessment_response.nil?
        end

        next unless responses_by_level_group.keys.count > 0

        responses_by_student[student.id] = {
          student_name: student.name,
          responses_by_assessment: responses_by_level_group
        }
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

  # Retrieve UserLevel and associated LevelSource objects associated with the
  # given students and assessment script levels. The return value is a nested
  # hash with the following structure:
  # {
  #   script_level_id: {
  #     student_id: [<UserLevel>]
  #   },
  # }
  #
  # The array of UserLevel objects includes the UserLevel associated with the
  # LevelGroup representing the assessment as well as UserLevels associated with
  # each sublevel that the user has completed.  UserLevel objects are sorted in
  # descending order by updated_at.
  private def get_assessment_progress_data(student_batch, script_id, assessment_script_levels)
    student_ids = student_batch.pluck(:id)
    progress_data = {}

    assessment_script_levels.each do |script_level|
      # each level in script_level here is a LevelGroup representing the assessment
      level_groups = script_level.levels
      level_group_ids = level_groups.pluck(:id)
      sublevel_ids = level_groups.map {|level_group| level_group.all_child_levels.pluck(:id)}.flatten

      # retrieve the UserLevels for the level group and sublevels all in one shot
      progress_data[script_level.id] =
        User.user_levels_by_user(student_ids, script_id, level_group_ids + sublevel_ids)
    end

    progress_data
  end

  # Helper function that builds the part of the section_responses response
  # corresponding to a given user and assessment. The third parameter is expected
  # to be the array of UserLevel objects returned by get_assessment_progress_data.
  private def summarize_assessment_response(student_id, script_level, student_progress)
    # Find the UserLevel that represents overall progress of the LevelGroup.
    # This logic is analogous to User#last_attempt_for_any.
    # Note: we intentionally no longer use the aggregated answers stored on
    # this UserLevel, see LP-1926 for details.
    level_group_ids = script_level.levels.pluck(:id)
    level_group_progress = student_progress.find do |user_level|
      level_group_ids.include?(user_level.level_id)
    end
    return [nil, nil] unless level_group_progress

    level_group = level_group_progress.level
    submitted = level_group_progress.submitted
    timestamp = level_group_progress.updated_at.to_datetime

    stats = {
      multi_count: 0,
      multi_count_correct: 0,
      match_count: 0,
      match_count_correct: 0
    }

    level_results = []
    level_group.levels.each do |level|
      # Find the UserLevel that corresponds to this level. This may be nil
      # if the student skipped a question.
      level_progress = student_progress.find do |user_level|
        user_level.level_id == level.id
      end
      student_answer = level_progress&.level_source&.data

      level_result = summarize_level_result(level, student_answer, stats)
      level_results << level_result
    end

    assessment_response = {
      lesson: script_level.lesson.localized_title,
      puzzle: script_level.position,
      question: level_group.properties["title"],
      url: build_script_level_url(script_level, section_id: @section.id, user_id: student_id),
      multi_correct: stats[:multi_count_correct],
      multi_count: stats[:multi_count],
      match_correct: stats[:match_count_correct],
      match_count: stats[:match_count],
      submitted: submitted,
      timestamp: timestamp,
      level_results: level_results
    }

    [level_group.id, assessment_response]
  end

  # Summarizes the given level and student answer into the format expected by
  # section_responses. Also updates the relevant counts in the given stats hash.
  private def summarize_level_result(level, student_answer, stats)
    level_result = {}

    case level
    when TextMatch, FreeResponse
      level_result[:type] = "FreeResponse"
    when Multi
      level_result[:type] = "Multi"
      stats[:multi_count] += 1
    when Match
      level_result[:type] = "Match"
      stats[:match_count] += 1
    end

    if student_answer
      case level
      when TextMatch, FreeResponse
        level_result[:student_result] = student_answer
        level_result[:status] = ""
      when Multi
        answer_indexes = Unit.cache_find_level(level.id).correct_answer_indexes_array
        student_result = student_answer.split(",").map(&:to_i).sort
        level_result[:student_result] = student_result

        if student_result == [-1]
          level_result[:student_result] = []
          level_result[:status] = "unsubmitted"
          # Deep comparison of arrays of indexes
        elsif student_result.present? && student_result - answer_indexes == [] && answer_indexes.length == student_result.length
          stats[:multi_count_correct] += 1
          level_result[:status] = "correct"
        else
          level_result[:status] = "incorrect"
        end
      when Match
        student_result = student_answer.split(",", -1)
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
          stats[:match_count_correct] += 1
        end
        level_result[:status] = option_status
      end
    else
      level_result[:status] = "unsubmitted"
    end

    level_result
  end
end
