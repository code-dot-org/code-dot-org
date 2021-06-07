require 'cdo/aws/cloudfront'
require 'google/apis/classroom_v1'

class ApiController < ApplicationController
  layout false
  include LevelsHelper

  private def query_clever_service(endpoint)
    tokens = current_user.oauth_tokens_for_provider(AuthenticationOption::CLEVER)
    begin
      auth = {authorization: "Bearer #{tokens[:oauth_token]}"}
      response = RestClient.get("https://api.clever.com/#{endpoint}", auth)
      yield JSON.parse(response)['data']
    rescue RestClient::ExceptionWithResponse => e
      render status: e.response.code, json: {error: e.response.body}
    end
  end

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
    rescue RestClient::Exception => e
      Honeybadger.notify(
        e,
        error_message: "Failed to retrieve OAuth token from Azure for use with the Immersive Reader API.",
        context: {
          client_id: tenant_id,
          tenant_id: client_id,
          subdomain: subdomain,
        }
      )
      render status: :failed_dependency, json: {error: 'Unable to get token from Azure.'}
    rescue JSON::JSONError => e
      Honeybadger.notify(
        e,
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

  GOOGLE_AUTH_SCOPES = [
    Google::Apis::ClassroomV1::AUTH_CLASSROOM_COURSES_READONLY,
    Google::Apis::ClassroomV1::AUTH_CLASSROOM_ROSTERS_READONLY,
  ].freeze

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
    rescue Google::Apis::ClientError, Google::Apis::AuthorizationError => error
      render status: :forbidden, json: {error: error}
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

      render json: section.summarize
    end
  end

  def user_menu
    show_pairing_dialog = !!session.delete(:show_pairing_dialog)
    @user_header_options = {}
    @user_header_options[:current_user] = current_user
    @user_header_options[:show_pairing_dialog] = show_pairing_dialog
    @user_header_options[:session_pairings] = pairing_user_ids
    @user_header_options[:loc_prefix] = 'nav.user.'
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

  use_database_pool lockable_state: :persistent

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
        lessons: script.lessons.each_with_object({}) do |lesson, lesson_hash|
          lesson_state = lesson.lockable_state(section.students)
          lesson_hash[lesson.id] = lesson_state unless lesson_state.nil?
        end
      }
    end

    render json: data
  end

  use_database_pool section_progress: :persistent

  def section_progress
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
        lessons: lessons,
      }
    }

    render json: data
  end

  use_database_pool section_level_progress: :persistent

  # This API returns data similar to user_progress, but aggregated for all users
  # in the section. It also only returns the "levels" portion
  # If not specified, the API will default to a page size of 50, providing the first page
  # of students
  def section_level_progress
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

  def script_structure
    script = Script.get_from_cache(params[:script])
    overview_path = CDO.studio_url(script_path(script))
    summary = script.summarize(true, current_user, true)
    summary[:path] = overview_path
    render json: summary
  end

  def script_standards
    script = Script.get_from_cache(params[:script])
    standards = script.standards
    render json: standards
  end

  use_database_pool user_progress: :persistent

  # Return a JSON summary of the user's progress for params[:script].
  def user_progress
    if current_user
      script = Script.get_from_cache(params[:script])
      user = params[:user_id].present? ? User.find(params[:user_id]) : current_user
      teacher_viewing_student = current_user.students.include?(user)
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

  use_database_pool user_progress_for_lesson: :persistent

  # Return the JSON details of the users progress on a particular script
  # level and marks the user as having started that level. (Because of the
  # latter side effect, this should only be called when the user sees the level,
  # to avoid spurious activity monitor warnings about the level being started
  # but not completed.)
  def user_progress_for_lesson
    response = user_summary(current_user)
    response[:signedIn] = !current_user.nil?

    script = Script.get_from_cache(params[:script])
    lesson = script.lessons[params[:lesson_position].to_i - 1]
    script_level = lesson.cached_script_levels[params[:level_position].to_i - 1]
    level = params[:level] ? Script.cache_find_level(params[:level].to_i) : script_level.oldest_active_level

    if current_user
      user_level = current_user.last_attempt(level, script)
      level_source = user_level.try(:level_source).try(:data)

      # Temporarily return the full set of progress so we can overwrite what the sessionStorage changed
      response[:progress] = summarize_user_progress(script, current_user)[:progress]

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
          stage: level_hash[:script_level].lesson.localized_title,
          puzzle: level_hash[:script_level].position,
          question: last_attempt.level.properties['title'],
          response: response,
          url: build_script_level_url(level_hash[:script_level], section_id: section.id, user_id: student.id)
        }
      end.compact
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

  private

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
