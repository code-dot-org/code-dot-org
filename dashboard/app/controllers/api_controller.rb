require 'google/apis/classroom_v1'

class ApiController < ApplicationController
  layout false
  include LevelsHelper

  private def query_clever_service(endpoint)
    begin
      auth = {authorization: "Bearer #{current_user.oauth_token}"}
      response = RestClient.get("https://api.clever.com/#{endpoint}", auth)
    rescue RestClient::ExceptionWithResponse => e
      render status: e.response.code, json: {error: e.response.body}
    end

    yield JSON.parse(response)['data']
  end

  def clever_classrooms
    query_clever_service("v1.1/teachers/#{current_user.uid}/sections") do |response|
      json = response.map do |section|
        data = section['data']
        {
          id: data['id'],
          name: data['name'],
          section: data['course_number'],
          enrollment_code: data['sis_id'],
        }
      end

      render json: {courses: json}
    end
  end

  def import_clever_classroom
    course_id = params[:courseId].to_s
    course_name = params[:courseName].to_s

    query_clever_service("v1.1/sections/#{course_id}/students") do |students|
      section = CleverSection.from_service(course_id, current_user.id, students, course_name)
      render json: section.summarize
    end
  end

  GOOGLE_AUTH_SCOPES = [
    Google::Apis::ClassroomV1::AUTH_CLASSROOM_COURSES_READONLY,
    Google::Apis::ClassroomV1::AUTH_CLASSROOM_ROSTERS_READONLY,
  ].freeze

  private def query_google_classroom_service
    client = Signet::OAuth2::Client.new(
      authorization_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_credential_uri:  'https://www.googleapis.com/oauth2/v3/token',
      client_id: CDO.dashboard_google_key,
      client_secret: CDO.dashboard_google_secret,
      refresh_token: current_user.oauth_refresh_token,
      access_token: current_user.oauth_token,
      expires_at: current_user.oauth_token_expiration,
      scope: GOOGLE_AUTH_SCOPES,
    )
    service = Google::Apis::ClassroomV1::ClassroomService.new
    service.authorization = client

    begin
      yield service

      if client.access_token != current_user.oauth_token
        current_user.update!(
          oauth_token: client.access_token,
          oauth_token_expiration: client.expires_in + Time.now.to_i,
        )
      end
    rescue Google::Apis::ClientError, Google::Apis::AuthorizationError => error
      render status: :forbidden, json: {error: error}
    end
  end

  def google_classrooms
    query_google_classroom_service do |service|
      response = service.list_courses(teacher_id: 'me')
      render json: response.to_h
    end
  end

  def import_google_classroom
    course_id = params[:courseId].to_s
    course_name = params[:courseName].to_s

    query_google_classroom_service do |service|
      students = []
      next_page_token = nil
      loop do
        response = service.list_course_students(course_id, page_token: next_page_token)
        students.concat response.students || []
        next_page_token = response.next_page_token
        break unless next_page_token
      end

      section = GoogleClassroomSection.from_service(course_id, current_user.id, students, course_name)

      render json: section.summarize
    end
  end

  def user_menu
    show_pairing_dialog = !!session.delete(:show_pairing_dialog)
    @user_header_options = {}
    @user_header_options[:current_user] = current_user
    @user_header_options[:show_pairing_dialog] = show_pairing_dialog
    @user_header_options[:session_pairings] = session[:pairings]
    @user_header_options[:loc_prefix] = 'nav.user.'
  end

  def user_hero
    head :not_found unless current_user
  end

  def update_lockable_state
    updates = params.require(:updates)
    updates.to_a.each do |item|
      # Convert string-boolean parameters to boolean
      %i(locked readonly_answers).each {|val| item[val] = JSONValue.value(item[val])}

      user_level_data = item[:user_level_data]
      if user_level_data[:user_id].nil? || user_level_data[:level_id].nil? || user_level_data[:script_id].nil?
        # Must provide user, level, and script ids
        return head :bad_request
      end

      if item[:locked] && item[:readonly_answers]
        # Can not view answers while locked
        return head :bad_request
      end

      unless User.find(user_level_data[:user_id]).teachers.include? current_user
        # Can only update lockable state for user's students
        return head :forbidden
      end
      UserLevel.update_lockable_state(
        user_level_data[:user_id],
        user_level_data[:level_id],
        user_level_data[:script_id],
        item[:locked],
        item[:readonly_answers]
      )
    end
    render json: {}
  end

  # For a given user, gets the lockable state for each student in each of their sections
  def lockable_state
    unless current_user
      render json: {}
      return
    end

    data = current_user.sections.each_with_object({}) do |section, section_hash|
      next if section.hidden
      script = load_script(section)

      section_hash[section.id] = {
        section_id: section.id,
        section_name: section.name,
        stages: script.stages.each_with_object({}) do |stage, stage_hash|
          stage_state = stage.lockable_state(section.students)
          stage_hash[stage.id] = stage_state unless stage_state.nil?
        end
      }
    end

    render json: data
  end

  def section_progress
    section = load_section
    script = load_script(section)

    # stage data
    stages = script.script_levels.select {|sl| sl.bonus.nil?}.group_by(&:stage).map do |stage, levels|
      {
        length: levels.length,
        title: ActionController::Base.helpers.strip_tags(stage.localized_title)
      }
    end

    script_levels = script.script_levels.select {|sl| sl.bonus.nil?}

    # Clients are seeing requests time out for large sections as we attempt to
    # send back all of this data. Allow them to instead request paginated data
    if params[:page] && params[:per]
      paged_students = section.students.page(params[:page]).per(params[:per])
      # As designed, if there are 50 students, the client will ask for both
      # page 1 and page 2, even though page 2 is out of range. However, it should
      # never ask for page 3
      if params[:page].to_i > paged_students.total_pages + 1
        return head :range_not_satisfiable
      end
    else
      paged_students = section.students
    end

    # student level completion data
    students = paged_students.map do |student|
      level_map = student.user_levels_by_level(script)
      paired_user_level_ids = PairedUserLevel.pairs(level_map.values.map(&:id))
      student_levels = script_levels.map do |script_level|
        user_levels = script_level.level_ids.map do |id|
          contained_levels = Script.cache_find_level(id).contained_levels
          if contained_levels.any?
            level_map[contained_levels.first.id]
          else
            level_map[id]
          end
        end.compact
        user_levels_ids = user_levels.map(&:id)
        level_class = (best_activity_css_class user_levels).dup
        paired = (paired_user_level_ids & user_levels_ids).any?
        level_class << ' paired' if paired
        title = paired ? '' : script_level.position
        # We use a list rather than a hash here to save ourselves from sending
        # the field names over the wire (which adds up to a lot of bytes when
        # multiplied across all the levels)
        [
          level_class,
          title,
          # we use to build a path that included section_id/user_id. We now let
          # the client adds these params itself, thus saving ourselves many bytes
          # over the wire again
          build_script_level_path(script_level)
        ]
      end
      {id: student.id, levels: student_levels}
    end

    data = {
      students: students,
      script: {
        id: script.id,
        name: data_t_suffix('script.name', script.name, 'title'),
        levels_count: script_levels.length,
        stages: stages,
      }
    }

    render json: data
  end

  # This API returns data similar to user_progress, but aggregated for all users
  # in the section. It also only returns the "levels" portion
  # TODO(caleybrock) - write a test for this function
  def section_level_progress
    section = load_section
    script = load_script(section)

    data = {}

    # Clients are seeing requests time out for large sections as we attempt to
    # send back all of this data. Allow them to instead request paginated data
    if params[:page] && params[:per]
      paged_students = section.students.page(params[:page]).per(params[:per])
      # As designed, if there are 50 students, the client will ask for both
      # page 1 and page 2, even though page 2 is out of range. However, it should
      # never ask for page 3
      if params[:page].to_i > paged_students.total_pages + 1
        return head :range_not_satisfiable
      end
    else
      paged_students = section.students
    end

    # TODO: This could likely be constructed more efficiently. At the very least,
    # instead of asking for a summary, and then using only one portion of it (levels)
    # we could probably expose a way to get just levels and have it be in the same
    # form as user_progress. However, we might be able to do even better and query
    # all the data that we need in a single db request
    paged_students.each do |student|
      data[student.id] = summarize_user_progress(script, student)[:levels]
    end
    render json: data
  end

  def student_progress
    student = load_student(params.require(:student_id))
    section = load_section
    # @script is used by user_states
    @script = load_script(section)

    progress_html = render_to_string(partial: 'shared/user_stats', locals: {user: student})

    data = {
      student: {
        id: student.id,
        name: student.name,
      },
      script: {
        id: @script.id,
        name: @script.localized_title
      },
      progressHtml: progress_html
    }

    render json: data
  end

  def script_structure
    script = Script.get_from_cache(params[:script])
    overview_path = CDO.studio_url(script_path(script))
    summary = script.summarize
    summary[:path] = overview_path
    render json: summary
  end

  # Return a JSON summary of the user's progress for params[:script].
  def user_progress
    if current_user
      script = Script.get_from_cache(params[:script])
      user = params[:user_id] ? User.find(params[:user_id]) : current_user
      render json: summarize_user_progress(script, user)
    else
      render json: {}
    end
  end

  # Return the JSON details of the users progress on a particular script
  # level and marks the user as having started that level. (Because of the
  # latter side effect, this should only be called when the user sees the level,
  # to avoid spurious activity monitor warnings about the level being started
  # but not completed.)
  def user_progress_for_stage
    response = user_summary(current_user)

    script = Script.get_from_cache(params[:script])
    stage = script.stages[params[:stage_position].to_i - 1]
    script_level = stage.cached_script_levels[params[:level_position].to_i - 1]
    level = params[:level] ? Script.cache_find_level(params[:level].to_i) : script_level.oldest_active_level

    if current_user
      user_level = current_user.last_attempt(level, script)
      level_source = user_level.try(:level_source).try(:data)

      response[:progress] = current_user.user_progress_by_stage(stage)
      if user_level
        response[:lastAttempt] = {
          timestamp: user_level.updated_at.to_datetime.to_milliseconds,
          source: level_source
        }
      end
      response[:isHoc] = script.hoc?

      recent_driver, recent_attempt, recent_user = UserLevel.most_recent_driver(script, level, current_user)
      if recent_driver
        response[:pairingDriver] = recent_driver
        if recent_attempt
          response[:pairingAttempt] = edit_level_source_path(recent_attempt)
        elsif level.channel_backed?
          @level = level
          recent_channel = get_channel_for(level, recent_user) if recent_user
          response[:pairingChannelId] = recent_channel if recent_channel
        end
      end
    end

    if level.finishable?
      slog(
        tag: 'activity_start',
        script_level_id: script_level.try(:id),
        level_id: level.contained_levels.empty? ? level.id : level.contained_levels.first.id,
        user_agent: request.user_agent.valid_encoding? ? request.user_agent : 'invalid_encoding',
        locale: locale
      )
    end

    render json: response
  end

  def section_text_responses
    section = load_section
    script = load_script(section)

    text_response_levels = script.text_response_levels

    data = section.students.map do |student|
      student_hash = {id: student.id, name: student.name}

      text_response_levels.map do |level_hash|
        last_attempt = student.last_attempt_for_any(level_hash[:levels])
        response = last_attempt.try(:level_source).try(:data)
        next unless response
        {
          student: student_hash,
          stage: level_hash[:script_level].stage.localized_title,
          puzzle: level_hash[:script_level].position,
          question: last_attempt.level.properties['title'],
          response: response,
          url: build_script_level_url(level_hash[:script_level], section_id: section.id, user_id: student.id)
        }
      end.compact
    end.flatten

    render json: data
  end

  # For each student, return an array of each long-assessment LevelGroup in progress or submitted.
  # Each such array contains an array of individual level results, matching the order of the LevelGroup's
  # levels.  For each level, the student's answer content is in :student_result, and its correctness
  # is in :correct.
  def section_assessments
    section = load_section
    script = load_script(section)

    level_group_script_levels = script.script_levels.includes(:levels).where('levels.type' => 'LevelGroup')

    data = section.students.map do |student|
      student_hash = {id: student.id, name: student.name}

      level_group_script_levels.map do |script_level|
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
              level_result[:correct] = "free_response"
            when Multi
              answer_indexes = Multi.find_by_id(level.id).correct_answer_indexes
              student_result = level_response["result"].split(",").sort.join(",")

              # Convert "0,1,3" to "A, B, D" for teacher-friendly viewing
              level_result[:student_result] = student_result.split(',').map {|k| Multi.value_to_letter(k.to_i)}.join(', ')

              if student_result == "-1"
                level_result[:student_result] = ""
                level_result[:correct] = "unsubmitted"
              elsif student_result == answer_indexes
                multi_count_correct += 1
                level_result[:correct] = "correct"
              else
                level_result[:correct] = "incorrect"
              end
            end
          else
            level_result[:correct] = "unsubmitted"
          end

          level_results << level_result
        end

        submitted = last_attempt[:submitted]
        timestamp = last_attempt[:updated_at].to_formatted_s

        {
          student: student_hash,
          stage: script_level.stage.localized_title,
          puzzle: script_level.position,
          question: level_group.properties["title"],
          url: build_script_level_url(script_level, section_id: section.id, user_id: student.id),
          multi_correct: multi_count_correct,
          multi_count: multi_count,
          submitted: submitted,
          timestamp: timestamp,
          level_results: level_results
        }
      end.compact
    end.flatten

    render json: data
  end

  # Return results for surveys, which are long-assessment LevelGroup levels with the anonymous property.
  # At least five students in the section must have submitted answers.  The answers for each contained
  # sublevel are shuffled randomly.
  def section_surveys
    section = load_section
    script = load_script(section)

    render json: LevelGroup.get_survey_results(script, section)
  end

  private

  def load_student(student_id)
    student = User.find(student_id)
    authorize! :read, student
    student
  end

  def load_section
    section = Section.find(params[:section_id])
    authorize! :read, section
    section
  end

  def load_script(section=nil)
    script_id = params[:script_id] if params[:script_id].present?
    script_id ||= section.default_script.try(:id)
    script = Script.get_from_cache(script_id) if script_id
    script ||= Script.twenty_hour_script
    script
  end
end
