require 'client_state'
require 'nokogiri'
require 'cdo/user_agent_parser'
require 'cdo/graphics/certificate_image'
require 'dynamic_config/gatekeeper'

module ApplicationHelper

  include LocaleHelper
  include ScriptLevelsHelper
  include ViewOptionsHelper
  include SurveyResultsHelper

  USER_AGENT_PARSER = UserAgentParser::Parser.new

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

  def format_xml(xml)
    doc = Nokogiri::XML(xml)
    doc.to_xhtml
  end

  def gender_options
    User::GENDER_OPTIONS.map do |key, value|
      [(key ? t(key) : ''), value]
    end
  end

  def user_type_options
    User::USER_TYPE_OPTIONS.map do |user_type|
      [t("user_type.#{user_type}"), user_type]
    end
  end

  def check_mark_html
    #raw "&#x2714;"
    image_tag(image_url('white-checkmark.png'))
  end

  def activity_css_class(result)
    # For definitions of the result values, see /app/src/constants.js.
    if result.nil? || result == 0
      'not_tried'
    elsif result >= Activity::FREE_PLAY_RESULT
      'perfect'
    elsif result >= Activity::MINIMUM_PASS_RESULT
      'passed'
    else
      'attempted'
    end
  end

  def show_flashes
    ret = ''
    if notice.present?
      ret += content_tag(:div, flash.notice, {class: 'alert alert-success'})
      flash.notice = nil
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

  def teacher_dashboard_url
    CDO.code_org_url '/teacher-dashboard'
  end

  def teacher_dashboard_section_progress_url(section)
    CDO.code_org_url "/teacher-dashboard#/sections/#{section.id}"
  end

  def teacher_dashboard_student_progress_url(section, user)
    CDO.code_org_url "/teacher-dashboard#/sections/#{section.id}/student/#{user.id}"
  end

  # used by devise to redirect user after signing in
  def signed_in_root_path(resource_or_scope)
    if session[:return_to]
      return session.delete(:return_to)
    elsif resource_or_scope.is_a?(User) && resource_or_scope.teacher?
      return teacher_dashboard_url
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
    elsif [Game::FLAPPY, Game::BOUNCE, Game::STUDIO, Game::CRAFT, Game::APPLAB].include? app
      asset_url "#{app}_sharing_drawing.png"
    else
      asset_url 'sharing_drawing.png'
    end
  end

  def signup_error_messages!
    # See also https://github.com/plataformatec/devise/blob/master/app/helpers/devise_helper.rb
    return "" if resource.errors.empty?

    messages = resource.errors.full_messages.map { |msg| content_tag(:li, msg) }.join
    sentence = resource.oauth? ?
      I18n.t("signup_form.additional_information") :
      I18n.t("errors.messages.not_saved",
                      count: resource.errors.count,
                      resource: resource.class.model_name.human.downcase)

    html = <<-HTML
    <div id="error_explanation">
      <h2>#{sentence}</h2>
      <ul>#{messages}</ul>
    </div>
    HTML

    html.html_safe
  end

  def is_k1?
    is_k1 = @script.try(:is_k1?)
    is_k1 = current_user.try(:primary_script).try(:is_k1?) if is_k1.nil?
    is_k1
  end

  def script_certificate_image_url(user, script)
    certificate_image_url(
        name: user.name,
        course: script.name,
        course_title: data_t_suffix('script.name', script.name, 'title'))
  end

  def minifiable_asset_path(path)
    path.sub!(/\.js$/, '.min.js') unless Rails.configuration.pretty_sharedjs
    asset_path(path)
  end

  # Returns a client state object for the current session and cookies.
  def client_state
    @client_state ||= ClientState.new(session, cookies)
  end

  # Check to see if we disabled signin from Gatekeeper
  def signin_button_enabled
    Gatekeeper.allows('show_signin_button', where: { script_name: @script.try(:name) }, default: true)
  end

  # Check to see if the tracking pixel is enabled for this script
  def tracking_pixel_enabled
    return true if @script.nil?
    Gatekeeper.allows('tracking_pixel_enabled', where: { script_name: @script.name }, default: true)
  end

  def page_mode
    PageMode.get(request)
  end
end
