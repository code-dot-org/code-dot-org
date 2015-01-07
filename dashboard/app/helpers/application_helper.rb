require 'nokogiri'
require 'cdo/user_agent_parser'
require 'cdo/graphics/certificate_image'

module ApplicationHelper

  include LocaleHelper
  include VideosHelper
  include ScriptLevelsHelper
  include StagesHelper

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

  def bullet_html
    #raw "&#9679;"
    image_tag('white-dot-grid.png')
  end

  def check_mark_html
    #raw "&#x2714;"
    image_tag(image_url('white-checkmark.png'))
  end

  def level_info(user, script_level)
    result =
      if user
        script_level.try(:user_level).try(:best_result)
      elsif (session[:progress] && session[:progress][script_level.level_id])
        result = session[:progress][script_level.level_id]
      end

    css_class = if result.nil?
                  'not_tried'
                elsif result >= Activity::FREE_PLAY_RESULT
                  'perfect'
                elsif result >= Activity::MINIMUM_PASS_RESULT
                  'passed'
                else
                  'attempted'
                end
    link = build_script_level_url(script_level)
    [css_class, link]
  end

  def show_flashes
    ret = ""
    if notice.present?
      ret += content_tag(:div, flash.notice, {class: "alert alert-success"})
      flash.notice = nil
    end

    if alert.present?
      ret += content_tag(:div, flash.alert, {class: "alert alert-danger"})
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

  def meta_image_url(params)
    level_source = params[:level_source]
    if level_source
      app = level_source.level.game.app
    else
      app = params[:app]
    end
    
    # playlab/studio and artist/turtle can have images
    if level_source.try(:level_source_image).try(:image)
      if level_source.level_source_image.s3?
        if app == Game::ARTIST then
          level_source.level_source_image.s3_framed_url
        else
          level_source.level_source_image.s3_url
        end
      else
        url_for(controller: "level_sources", action: "generate_image", id: level_source.id, only_path: false)
      end
    elsif app == Game::FLAPPY || app == Game::BOUNCE || app == Game::STUDIO
      asset_url "#{app}_sharing_drawing.png"
    else
      asset_url 'sharing_drawing.png'
    end
  end

  def original_image_url(level_source)
    if level_source.try(:level_source_image).try(:s3?)
      level_source.level_source_image.s3_url
    else
      original_image_level_source_path(level_source.id)
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

  def playlab_freeplay_path
    script_stage_script_level_path(*is_k1? ? ['course1', 16, 6] : ['playlab', 1, 10])
  end

  def artist_freeplay_path
    script_stage_script_level_path(*is_k1? ? ['course1', 18, 10] : ['artist', 1, 10])
  end
  
  def script_certificate_image_url(user, script)
    if script.hoc?
      script_name = 'hoc'
    elsif script.twenty_hour?
      script_name = '20hours'
    else
      script_name = data_t_suffix('script.name', script.name, "title")
    end
    certificate_image_url(name: user.name, course: script_name)
  end
end
