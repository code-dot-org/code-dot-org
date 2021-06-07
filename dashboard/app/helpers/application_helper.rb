require 'client_state'
require 'nokogiri'
require 'cdo/user_agent_parser'
require 'cdo/graphics/certificate_image'
require 'cdo/pegasus/donor'
require 'dynamic_config/gatekeeper'
require 'cdo/shared_constants'
require 'cdo/asset_helper'

module ApplicationHelper
  include LocaleHelper
  include ScriptLevelsHelper
  include ViewOptionsHelper
  include SurveyResultsHelper
  include SharedConstants

  USER_AGENT_PARSER = UserAgentParser::Parser.new

  PUZZLE_PAGE_NONE = -1

  def browser
    @browser ||= USER_AGENT_PARSER.parse request.headers["User-Agent"]
  end

  def ago(from_time)
    s = distance_of_time_in_words_to_now(from_time)
    # XXX This is horribly broken for localization.
    s = s.gsub("about ", "")
    s = s.gsub("less than ", "")
    s = s.gsub("a minute", "1 minute")
    "#{s} ago"
  end

  def gender_options
    Policies::Gender::OPTIONS.map do |key, value|
      [(key ? t(key) : ''), value]
    end
  end

  def user_type_options
    User::USER_TYPE_OPTIONS.map do |user_type|
      [t("user_type.#{user_type}"), user_type]
    end
  end

  def age_options
    User::AGE_DROPDOWN_OPTIONS.map do |age|
      [age, age]
    end
  end

  def check_mark_html
    #raw "&#x2714;"
    image_tag(image_url('white-checkmark.png'))
  end

  def activity_css_class(user_level)
    best_activity_css_class([user_level])
  end

  def best_activity_css_class(user_levels)
    # For definitions of the result values, see /app/src/constants.js.
    user_level = user_levels.
        select {|ul| ul.try(:best_result) && ul.best_result != 0}.
        max_by(&:best_result) ||
        user_levels.first
    result = user_level.try(:best_result)

    if result == Activity::REVIEW_REJECTED_RESULT
      LEVEL_STATUS.review_rejected
    elsif result == Activity::REVIEW_ACCEPTED_RESULT
      LEVEL_STATUS.review_accepted
    elsif user_level.try(:submitted)
      LEVEL_STATUS.submitted
    elsif result.nil? || result == 0
      LEVEL_STATUS.not_tried
    elsif result >= Activity::FREE_PLAY_RESULT
      LEVEL_STATUS.perfect
    elsif result >= Activity::MINIMUM_PASS_RESULT
      LEVEL_STATUS.passed
    else
      LEVEL_STATUS.attempted
    end
  end

  def show_flashes
    ret = ''
    if notice.present?
      ret += content_tag(:div, flash.notice, {class: 'alert alert-success'})
      flash.notice = nil
    end

    if flash[:info].present?
      ret += content_tag(:div, flash[:info], {class: 'alert alert-info'})
      flash[:info] = nil
    end

    if alert.present?
      ret += content_tag(:div, flash.alert, {class: 'alert alert-danger'})
      flash.alert = nil
    end

    ret
  end

  def code_org_root_path
    CDO.code_org_url
  end

  def home_url
    '/home'
  end

  def teacher_dashboard_url
    CDO.code_org_url '/teacher-dashboard'
  end

  def teacher_dashboard_section_progress_url(section)
    "/teacher_dashboard/sections/#{section.id}/progress"
  end

  # used by sign-up to retrieve the user return_to URL from the session and delete it.
  def get_and_clear_session_user_return_to
    return session.delete(:user_return_to) if session[:user_return_to]
  end

  # used by devise to redirect user after signing in
  def signed_in_root_path(resource_or_scope)
    if resource_or_scope.is_a?(User) && resource_or_scope.teacher?
      return home_url
    end
    '/'
  end

  def external_oauth_sign_out_url(provider)
    case provider.to_sym
    when :facebook
      'https://www.facebook.com/logout.php'
    when :windowslive
      'http://login.live.com/logout.srf'
    when :google_oauth2
      'https://accounts.google.com/logout'
    end
  end

  # A view helper that returns a unicode checkmark ✓ or ✗ depending on the value of flag.
  def boolean_checkmark(flag)
    if flag
      '<span class="true_flag">&#x2713;</span>'.html_safe
    else
      '<span class="false_flag">&#x2717;</span>'.html_safe
    end
  end

  def meta_image_url(opts = {})
    app = opts[:level_source].try(:level).try(:game).try(:app) || opts[:level].try(:game).try(:app)
    skin = opts[:level].try(:properties).try(:[], "skin")

    # playlab/studio and artist/turtle can have images
    if opts[:level_source].try(:level_source_image)
      level_source = opts[:level_source]
      if level_source.level_source_image
        if app == Game::ARTIST
          level_source.level_source_image.s3_framed_url
        else
          level_source.level_source_image.s3_url
        end
      end
    elsif [Game::FLAPPY, Game::STUDIO, Game::CRAFT, Game::APPLAB, Game::GAMELAB, Game::WEBLAB, Game::DANCE].include? app
      asset_url "#{app}_sharing_drawing.png"
    elsif app == Game::BOUNCE
      if ["basketball", "sports"].include? skin
        asset_url "#{skin}_sharing_drawing.png"
      else
        asset_url "bounce_sharing_drawing.png"
      end
    else
      asset_url 'sharing_drawing.png'
    end
  end

  def signup_error_messages!
    # See also https://github.com/plataformatec/devise/blob/master/app/helpers/devise_helper.rb
    return "" if resource.errors.empty?

    messages = resource.errors.full_messages.map {|msg| content_tag(:li, msg)}.join
    sentence = resource.oauth? ?
      I18n.t("signup_form.additional_information") :
      I18n.t(
        "errors.messages.not_saved",
        count: resource.errors.count,
        resource: resource.class.model_name.human.downcase
      )

    html = <<-HTML
    <div id="error_explanation">
      <h2>#{sentence}</h2>
      <ul>#{messages}</ul>
    </div>
    HTML

    html.html_safe
  end

  def script_certificate_image_url(user, script)
    certificate_image_url(
      name: user.name,
      course: script.name,
      course_title: data_t_suffix('script.name', script.name, 'title')
    )
  end

  # Returns a client state object for the current session and cookies.
  def client_state
    @client_state ||= ClientState.new(session, cookies)
  end

  # Check to see if we disabled signin from Gatekeeper
  def signin_button_enabled
    Gatekeeper.allows('show_signin_button', where: {script_name: @script.try(:name)}, default: true)
  end

  # Check to see if the tracking pixel is enabled for this script
  def tracking_pixel_enabled
    return true if @script.nil?
    Gatekeeper.allows('tracking_pixel_enabled', where: {script_name: @script.name}, default: true)
  end

  def page_mode
    PageMode.get(request)
  end

  def response_for_share_failure(share_failure)
    return nil unless share_failure
    {}.tap do |failure|
      failure[:message] = share_failure_message(share_failure.type)
      failure[:type] = share_failure.type
      failure[:contents] = share_failure.content unless share_failure.type == ShareFiltering::FailureType::PROFANITY
    end
  end

  # Wrapper function used to inhibit Brakeman (security static code analysis) warnings. To inhibit a false positive warning,
  # wrap the code in question in this function.
  def brakeman_no_warn(obj)
    obj
  end

  private

  def share_failure_message(failure_type)
    case failure_type
      when ShareFiltering::FailureType::EMAIL
        t('share_code.email_not_allowed')
      when ShareFiltering::FailureType::ADDRESS
        t('share_code.address_not_allowed')
      when ShareFiltering::FailureType::PHONE
        t('share_code.phone_number_not_allowed')
      when ShareFiltering::FailureType::PROFANITY
        t('share_code.profanity_not_allowed')
      else
        raise ArgumentError.new("Unknown share failure type #{failure_type}")
    end
  end
end
