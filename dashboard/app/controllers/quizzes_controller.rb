class QuizzesController < ApplicationController
  include LevelsHelper

  before_action :authenticate_user!
  load_and_authorize_resource :section, only: [:section_responses]

  # For every Quiz in a script, return its question/answer metadata (teacher-only -
  # includes correct answers) together with a per-section summary of student
  # attempts. Analogous to Api::V1::AssessmentsController#index +
  # #section_responses, but as a single call: Quiz's data model (QuizAttempt,
  # QuizQuestionResponse) makes both cheap to compute together, unlike LevelGroup's
  # UserLevel/LevelSource walk.
  #
  # Only MultipleChoiceQuestion is reported - matches Quiz.tsx's own P0 scope
  # (student UI only renders multiple choice today).
  #
  # Example output:
  # {
  #   "5678": {              # a Quiz level id
  #     id: "5678",
  #     name: "Quiz for Chapter 1",
  #     questions: [{level_id: "42", type: "Multi", question_index: 0, question_text: "...", answers: [...]}],
  #     responses_by_student: {
  #       "12": {
  #         student_name: "caley",
  #         most_recent: {level_results: [...], multi_correct: 1, multi_count: 2, submitted: true, ...},
  #         highest_scoring: {...},
  #       },
  #       ...
  #     },
  #   },
  #   ...
  # }
  #
  # GET /quizzes/section_responses?section_id=&script_id=&course_version_id=
  def section_responses
    unless current_user&.verified_instructor?
      render json: {}, status: :forbidden
      return
    end

    script = Unit.get_from_cache(params[:script_id])
    unit_group = CourseVersion.find_by_id(params[:course_version_id])&.content_root
    unit_group_unit = Queries::Courses.unit_group_unit(script, unit_group)

    quizzes = {}

    script.get_quiz_script_levels.each do |script_level|
      quiz = script_level.levels[0]
      mc_questions = quiz.quiz_level_questions.includes(:quiz_question).
        map(&:quiz_question).select {|q| q.is_a?(MultipleChoiceQuestion)}
      # A quiz with no multiple-choice questions has nothing this endpoint can
      # report yet (see the class comment) - omit it rather than adding a dead
      # entry to the teacher's assessment picker.
      next if mc_questions.empty?

      quizzes[quiz.id.to_s] = {
        id: quiz.id.to_s,
        name: script_level.lesson.localized_title,
        questions: summarize_quiz_questions(mc_questions),
        responses_by_student: summarize_quiz_responses_by_student(quiz, mc_questions, script, script_level, unit_group_unit),
      }
    end

    render json: quizzes
  end

  private def summarize_quiz_questions(mc_questions)
    mc_questions.each_with_index.map do |question, index|
      choices = question.question['choices']
      {
        level_id: question.id.to_s,
        type: 'Multi',
        question_index: index,
        question_text: question.question['stem'],
        answers: choices.map {|c| {text: c['text'], correct: c['id'] == question.question['correct_choice_id']}},
      }
    end
  end

  private def summarize_quiz_responses_by_student(quiz, mc_questions, script, script_level, unit_group_unit)
    responses_by_student = {}

    @section.students.each do |student|
      attempts = QuizAttempt.where(user: student, level: quiz, script: script).order(:attempt_number)
      next if attempts.empty?

      most_recent = attempts.last
      submitted = attempts.select(&:submitted_at)
      highest_scoring = submitted.empty? ? most_recent : submitted.max_by {|a| [a.score || 0, a.attempt_number]}

      responses_by_student[student.id.to_s] = {
        student_name: student.name,
        most_recent: summarize_quiz_attempt(most_recent, quiz, mc_questions, script_level, unit_group_unit, student.id),
        highest_scoring: summarize_quiz_attempt(highest_scoring, quiz, mc_questions, script_level, unit_group_unit, student.id),
      }
    end

    responses_by_student
  end

  # Analogous to Api::V1::AssessmentsController#summarize_assessment_response, but
  # correctness is read directly off QuizQuestionResponse#score/#max_score rather
  # than QuizAttempt#question_results, since that helper redacts `correct` based on
  # the quiz's student-facing show_correctness setting - this is a teacher-only,
  # always-graded view.
  private def summarize_quiz_attempt(attempt, quiz, mc_questions, script_level, unit_group_unit, student_id)
    responses_by_question_id = attempt.quiz_question_responses.
      where(quiz_question_id: mc_questions.map(&:id)).index_by(&:quiz_question_id)

    multi_correct = 0
    level_results = mc_questions.map do |question|
      response = responses_by_question_id[question.id]
      if response.nil?
        {type: 'Multi', student_result: [], status: 'unsubmitted'}
      else
        choices = question.question['choices']
        selected_choice_id = response.response_data['selectedChoiceId']
        selected_index = choices.index {|c| c['id'] == selected_choice_id}
        correct = response.max_score.present? && response.score == response.max_score
        multi_correct += 1 if correct
        {
          type: 'Multi',
          student_result: selected_index ? [selected_index] : [],
          status: correct ? 'correct' : 'incorrect',
        }
      end
    end

    {
      lesson: script_level.lesson.localized_title,
      puzzle: script_level.position,
      question: quiz.properties['title'] || quiz.name,
      url: build_script_level_url(script_level, unit_group_unit: unit_group_unit, section_id: @section.id, user_id: student_id),
      multi_correct: multi_correct,
      multi_count: mc_questions.length,
      match_correct: 0,
      match_count: 0,
      submitted: attempt.submitted_at.present?,
      timestamp: (attempt.submitted_at || attempt.updated_at).to_datetime,
      level_results: level_results,
    }
  end
end
