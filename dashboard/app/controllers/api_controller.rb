require 'google-apis-classroom_v1'

class ApiController < ApplicationController
  layout false
  include LevelsHelper

  GOOGLE_AUTH_SCOPES = [
    Google::Apis::ClassroomV1::AUTH_CLASSROOM_COURSES_READONLY,
    Google::Apis::ClassroomV1::AUTH_CLASSROOM_ROSTERS_READONLY,
  ].freeze

  # Calls Azure Cognitive Services in order to get a temporary OAuth token with access to the Immersive Reader API.
  # Requires the following configurations
  #   CDO.imm_reader_tenant_id
  #   CDO.imm_reader_client_id
  #   CDO.imm_reader_subdomain
  #   CDO.imm_reader_client_secret
  # @return [Hash] {token: 'string', subdomain: 'string'}
  # @return [Hash] {error: 'string'}
  def immersive_reader_token
    tenant_id = CDO.imm_reader_tenant_id
    client_id = CDO.imm_reader_client_id
    subdomain = CDO.imm_reader_subdomain
    client_secret = CDO.imm_reader_client_secret # Do not log this secret
    if tenant_id.blank? || client_id.blank? || subdomain.blank? || client_secret.blank?
      return render status: :internal_server_error, json: {error: 'Environment not configured for Immersive Reader.'}
    end

    begin
      headers = {
        'content-type' => 'application/x-www-form-urlencoded'
      }
      url = "https://login.windows.net/#{tenant_id}/oauth2/token"
      form = {
        'grant_type' => 'client_credentials',
        'client_id' => client_id,
        'client_secret' => client_secret, # Do not log this secret
        'resource' => 'https://cognitiveservices.azure.com/'
      }
      auth_response = JSON.parse(RestClient.post(url, form, headers))
      response = {
        token: auth_response['access_token'],
        subdomain: subdomain,
      }
      render json: response
    rescue RestClient::Exception => exception
      Harness.error_notify(
        exception,
        error_message: "Failed to retrieve OAuth token from Azure for use with the Immersive Reader API.",
        context: {
          client_id: tenant_id,
          tenant_id: client_id,
          subdomain: subdomain,
        }
      )
      render status: :failed_dependency, json: {error: 'Unable to get token from Azure.'}
    rescue JSON::JSONError => exception
      Harness.error_notify(
        exception,
        error_message: "Failed to parse response from Azure when trying to get OAuth token for use with the Immersive Reader API.",
        context: {
          client_id: tenant_id,
          tenant_id: client_id,
          subdomain: subdomain,
        }
      )
      render status: :internal_server_error, json: {error: 'Unable to get token from Azure.'}
    end
  end

  def clever_classrooms
    return head :forbidden unless current_user

    uid = current_user.uid_for_provider(AuthenticationOption::CLEVER)
    query_clever_service("v2.1/teachers/#{uid}/sections") do |response|
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
    return head :forbidden unless current_user

    course_id = params[:courseId].to_s
    course_name = params[:courseName].to_s

    query_clever_service("v2.1/sections/#{course_id}/students") do |students|
      section = CleverSection.from_service(course_id, current_user.id, students, course_name)
      render json: section.summarize
    end
  end

  def google_classrooms
    return head :forbidden unless current_user
    query_google_classroom_service do |service|
      response = service.list_courses(teacher_id: 'me')
      render json: response.to_h
    end
  end

  def import_google_classroom
    return head :forbidden unless current_user
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

      # If a teacher passes the criteria for becoming verified, upgrade them here
      if section && Policies::User.verified_teacher_candidate?(current_user)
        current_user.verify_teacher!
      end

      render json: section.summarize
    end
  end

  def user_menu
    prevent_caching
    show_pairing_dialog = !!session.delete(:show_pairing_dialog)
    @user_header_options = {}
    @user_header_options[:current_user] = current_user
    @user_header_options[:show_pairing_dialog] = show_pairing_dialog
    @user_header_options[:session_pairings] = pairing_user_ids
    @user_header_options[:loc_prefix] = 'nav.user.'
    @user_header_options[:show_create_menu] = params[:showCreateMenu]
  end

  def update_lockable_state
    return render status: :bad_request, json: {error: I18n.t("lesson_lock.error.no_updates")} if params[:updates].blank?
    updates = params.require(:updates)
    updates.to_a.each do |item|
      # Convert string-boolean parameters to boolean
      item[:locked] = JSONValue.value(item[:locked])
      item[:readonly_answers] = JSONValue.value(item[:readonly_answers])

      user_level_data = item[:user_level_data]
      if user_level_data[:user_id].nil? || user_level_data[:level_id].nil? || user_level_data[:script_id].nil?
        # Must provide user, level, and script ids
        return render status: :bad_request, json: {error: I18n.t("lesson_lock.error.missing_params")}
      end

      if item[:locked] && item[:readonly_answers]
        # Can not view answers while locked
        return render status: :bad_request, json: {error: I18n.t("lesson_lock.error.cannot_view_locked_answers")}
      end

      unless User.find(user_level_data[:user_id]).teachers.include? current_user
        # Can only update lockable state for user's students
        return render status: :forbidden, json: {error: I18n.t("lesson_lock.error.forbidden")}
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

  use_reader_connection_for_route(:lockable_state)

  # For a given user, gets the lockable state for each student in each of their sections
  def lockable_state
    prevent_caching
    unless current_user
      render json: {}
      return
    end

    data = current_user.sections_instructed.each_with_object({}) do |section, section_hash|
      next if section.hidden
      script = load_script(section)

      section_hash[section.id] = {
        section_id: section.id,
        section_name: section.name,
        lessons: script.lessons.each_with_object({}) do |lesson, lesson_hash|
          lesson_state = lesson.lockable_state(section.students)
          lesson_hash[lesson.id] = lesson_state unless lesson_state.nil?
        end
      }
    end

    render json: data
  end

  use_reader_connection_for_route(:section)
  def section
    section = load_section

    render json: section.selected_section_summarize.merge(section.concise_summarize)
  end

  use_reader_connection_for_route(:section_progress)

  def section_progress
    prevent_caching
    section = load_section
    script = load_script(section)

    # lesson data
    lessons = script.script_levels.select {|sl| sl.bonus.nil?}.group_by(&:lesson).map do |lesson, levels|
      {
        length: levels.length,
        title: ActionController::Base.helpers.strip_tags(lesson.localized_title)
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
        user_levels = script_level.level_ids.filter_map do |id|
          contained_levels = Unit.cache_find_level(id).contained_levels
          if contained_levels.any?
            level_map[contained_levels.first.id]
          else
            level_map[id]
          end
        end
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
        lessons: lessons,
      }
    }

    render json: data
  end

  def show_courses_with_progress
    section = load_section
    render json: CourseVersion.courses_for_unit_selector(section.participant_unit_ids)
  end

  use_reader_connection_for_route(:section_level_progress)

  # This API returns data similar to user_progress, but aggregated for all users
  # in the section. It also only returns the "levels" portion
  # If not specified, the API will default to a page size of 50, providing the first page
  # of students
  def section_level_progress
    prevent_caching
    section = load_section
    script = load_script(section)

    # Clients are seeing requests time out for large sections as we attempt to
    # send back all of this data. Allow them to instead request paginated data
    page = [params[:page].to_i, 1].max
    per = params[:per].to_i || 50

    paged_students = section.students.page(page).per(per)
    # As designed, if there are 50 students, the client will ask for both
    # page 1 and page 2, even though page 2 is out of range. However, it should
    # never ask for page 3
    if page > paged_students.total_pages + 1
      return head :range_not_satisfiable
    end

    student_progress, student_timestamps = script_progress_for_users(paged_students, script)

    # Get the level progress for each student
    render json: {
      student_progress: student_progress,
      student_last_updates: student_timestamps,
      pagination: {
        total_pages: paged_students.total_pages,
        page: page,
        per: per,
      }
    }
  end

  # GET /api/teacher_panel_progress/:section_id
  # Get complete details of a particular section for the teacher panel progress
  def teacher_panel_progress
    prevent_caching
    section = load_section
    script = load_script(section)

    if params[:level_id]
      script_level = script.script_levels.find do |sl|
        sl.level_ids.include?(params[:level_id].to_i)
      end
      return head :bad_request if script_level.nil?

      student_progress = section.students.order(:name).map do |student|
        script_level.summarize_for_teacher_panel(student, current_user)
      end

      teacher_progress = script_level.summarize_for_teacher_panel(current_user)
    elsif params[:is_lesson_extras] && params[:lesson_id]
      lesson = script.lessons.find do |l|
        l.id == params[:lesson_id].to_i
      end
      return head :bad_request if lesson.nil?

      bonus_level_ids = lesson.script_levels.where(bonus: true).map(
        &:level_ids
      ).flatten

      student_progress = section.students.order(:name).map do |student|
        ScriptLevel.summarize_as_bonus_for_teacher_panel(lesson.script, bonus_level_ids, student)
      end

      teacher_progress = ScriptLevel.summarize_as_bonus_for_teacher_panel(lesson.script, bonus_level_ids, current_user)
    else
      return head :bad_request
    end

    render json: student_progress.unshift(teacher_progress)
  end

  # Get /api/teacher_panel_section
  def teacher_panel_section
    prevent_caching
    teacher_sections = current_user&.sections_instructed&.where(hidden: false)

    if teacher_sections.blank?
      head :no_content
      return
    end

    section_id = params[:section_id].present? ? params[:section_id].to_i : nil

    if section_id
      section = teacher_sections.find_by(id: section_id)
      if section.present?
        render json: section.summarize if section.present?
        return
      end
    elsif teacher_sections.length == 1
      render json: teacher_sections[0].summarize
      return
    end

    head :no_content
  end

  def script_structure
    script = Unit.get_from_cache(params[:script])
    overview_path = CDO.studio_url(script_path(script))
    summary = script.summarize(true, current_user, true)
    summary[:path] = overview_path
    render json: summary
  end

  def script_standards
    script = Unit.get_from_cache(params[:script])
    standards = script.standards
    render json: standards
  end

  use_reader_connection_for_route(:user_progress)

  # Return a JSON summary of the user's progress for params[:script].
  def user_progress
    prevent_caching
    if current_user
      if params[:user_id].present?
        user = User.find(params[:user_id])
        return head :forbidden unless user.student_of?(current_user) || user.id == current_user.id
      else
        user = current_user
      end

      script = Unit.get_from_cache(params[:script])
      teacher_viewing_student = !current_user.student? && current_user.students.include?(user)
      render json: summarize_user_progress(script, user).merge(
        {
          signedIn: true,
          teacherViewingStudent: teacher_viewing_student,
        }
      )
    else
      render json: {signedIn: false}
    end
  end

  use_reader_connection_for_route(:user_app_options)

  # Returns app_options values that are user-specific. This is used on cached
  # levels.
  def user_app_options
    prevent_caching
    response = {}

    script = Unit.get_from_cache(params[:script])
    lesson = script.lessons[params[:lesson_position].to_i - 1]
    script_level = lesson.cached_script_levels[params[:level_position].to_i - 1]
    level = params[:level] ? Unit.cache_find_level(params[:level].to_i) : script_level.oldest_active_level

    if current_user
      response[:signedIn] = true

      # Set `user` to the user that we should use to calculate the app_options
      # and note if the signed-in user is viewing another user (e.g. a teacher
      # viewing a student's work).
      if params[:user_id].present?
        user = User.find(params[:user_id])
        return head :forbidden unless can?(:view_as_user, script_level, user)
        viewing_other_user = true
      else
        user = current_user
        viewing_other_user = false
      end

      if viewing_other_user
        response[:isStarted] = level_started?(level, script, user)

        # This is analogous to readonly_view_options
        response[:skipInstructionsPopup] = true
        response[:readonlyWorkspace] = true
        response[:callouts] = []
      end

      # TODO: There are many other user-specific values in app_options that may
      # need to be sent down.  See LP-2086 for a list of potential values.

      response[:disableSocialShare] = user.under_13?
      response[:isInstructor] = script.can_be_instructor?(current_user)
      response.merge!(progress_app_options(script, level, user))
    else
      response[:signedIn] = false
      viewing_other_user = false
    end

    if params[:get_channel_id] == "true"
      response[:channel] = viewing_other_user ?
        get_channel_for(level, script.id, user) :
        get_channel_for(level, script.id)
      response[:reduceChannelUpdates] =
        !Gatekeeper.allows("updateChannelOnSave", where: {script_name: script.name}, default: true)
    end

    render json: response
  end

  # GET /api/example_solutions/:script_level_id/:level_id
  def example_solutions
    script_level = Unit.cache_find_script_level params[:script_level_id].to_i
    level = Unit.cache_find_level params[:level_id].to_i
    section_id = params[:section_id].present? ? params[:section_id].to_i : nil
    render json: script_level.get_example_solutions(level, current_user, section_id)
  end

  def section_text_responses
    section = load_section
    script = load_script(section)

    text_response_levels = script.text_response_levels

    data = section.students.map do |student|
      student_hash = {id: student.id, name: student.name}

      text_response_levels.filter_map do |level_hash|
        last_attempt = student.last_attempt_for_any(level_hash[:levels])
        response = last_attempt.try(:level_source).try(:data)
        next unless response
        {
          student: student_hash,
          lesson: level_hash[:script_level].lesson.localized_title,
          puzzle: level_hash[:script_level].position,
          question: last_attempt.level.properties['title'],
          response: response,
          url: build_script_level_url(level_hash[:script_level], section_id: section.id, user_id: student.id)
        }
      end
    end.flatten

    render json: data
  end

  # GET /dashboardapi/sign_cookies
  def sign_cookies
    # length of time the browser can privately cache this request for cookies
    expires_in 1.hour

    # length of time these cookies are considered valid by cloudfront
    expiration_date = Time.now + 4.hours
    resource = CDO.studio_url('/restricted/*', CDO.default_scheme)

    cloudfront_cookies = AWS::CloudFront.signed_cookies(resource, expiration_date)

    cloudfront_cookies.each do |k, v|
      cookies[k] = v
    end

    head :ok
  end

  # PUT /api/firehose_unreachable
  def firehose_unreachable
    original_data = params.require(:original_data)
    event = original_data['event']
    project_id = original_data['project_id'] || nil
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'firehose-error-unreachable',
        event: event,
        project_id: project_id,
        data_string: params.require(:error_text),
        data_json: original_data.to_json
      }
    )
  end

  private def query_clever_service(endpoint)
    tokens = current_user.oauth_tokens_for_provider(AuthenticationOption::CLEVER)
    begin
      auth = {authorization: "Bearer #{tokens[:oauth_token]}"}
      response = RestClient.get("https://api.clever.com/#{endpoint}", auth)
      yield JSON.parse(response)['data']
    rescue RestClient::ExceptionWithResponse => exception
      render status: exception.response.code, json: {error: exception.response.body}
    end
  end

  private def query_google_classroom_service
    tokens = current_user.oauth_tokens_for_provider(AuthenticationOption::GOOGLE)
    client = Signet::OAuth2::Client.new(
      authorization_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_credential_uri:  'https://www.googleapis.com/oauth2/v3/token',
      client_id: CDO.dashboard_google_key,
      client_secret: CDO.dashboard_google_secret,
      refresh_token: tokens[:oauth_refresh_token],
      access_token: tokens[:oauth_token],
      expires_at: tokens[:oauth_token_expiration],
      scope: GOOGLE_AUTH_SCOPES,
    )
    service = Google::Apis::ClassroomV1::ClassroomService.new
    service.authorization = client

    begin
      yield service
    rescue Google::Apis::ClientError, Google::Apis::AuthorizationError => exception
      render status: :forbidden, json: {error: exception}
    end
  end

  # Gets progress-related app_options for the given script and level for the
  # given user. This code is analogous to parts of LevelsHelper#app_options.
  # TODO: Eliminate this logic from LevelsHelper#app_options or refactor methods
  # to share code.
  private def progress_app_options(script, level, user)
    response = {}

    user_level = user.last_attempt(level, script)
    level_source = user_level.try(:level_source).try(:data)

    if user_level
      response[:lastAttempt] = {
        timestamp: user_level.updated_at.to_datetime.to_milliseconds,
        source: level_source
      }

      # Pairing info
      is_navigator = user_level.navigator?
      if is_navigator
        driver = user_level.driver
        driver_level_source_id = user_level.driver_level_source_id
      end

      response[:isNavigator] = is_navigator
      if driver
        response[:pairingDriver] = driver.name
        if driver_level_source_id
          response[:pairingAttempt] = edit_level_source_path(driver_level_source_id)
        elsif level.channel_backed?
          response[:pairingChannelId] = get_channel_for(level, script.id, driver)
        end
      end
    end

    response
  end

  private def load_section
    section = Section.find(params[:section_id])
    authorize! :read, section
    section
  end

  private def load_script(section = nil)
    script_id = params[:script_id] if params[:script_id].present?
    script_id ||= section.default_script.try(:id)
    script = Unit.get_from_cache(script_id) if script_id
    script ||= Unit.twenty_hour_unit
    script
  end
end
