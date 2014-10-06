require 'nokogiri'

module ApplicationHelper

  include LocaleHelper
  include VideosHelper
  include ScriptLevelsHelper
  include StagesHelper

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

  def level_box_class(best_result)
    if !best_result then 'level_untried'
    elsif best_result == Activity::BEST_PASS_RESULT || best_result == Activity::FREE_PLAY_RESULT then 'level_aced'
    elsif best_result < Activity::MINIMUM_PASS_RESULT then 'level_undone'
    else 'level_done'
    end
  end

  def gender_options
    User::GENDER_OPTIONS.map do |key, value|
      [(key ? t(key) : ''), value]
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

  def eligible_for_prize?
    # check IP for US users only (ideally, we'd check if the teacher is in the US for teacher prizes)
    # If the geolocation fails, assume non-US.
    request.location.try(:country_code) == 'US'
  end

  def level_info(user, script_level)
    passed = level_passed({user: user, user_level: script_level.user_level, level_id: script_level.level_id})
    link = build_script_level_url(script_level)
    [passed, link]
  end

  def show_flashes
    ret = ""
    if notice
      ret += content_tag(:p, flash.notice, {id: "notice"})
      flash.notice = nil
    end

    if alert
      ret += content_tag(:p, flash.alert, {id: "alert"})
      flash.alert = nil
    end

    ret
  end

  def canonical_hostname(domain)
    CDO.canonical_hostname(domain)
  end

  def code_org_root_path
    'http://' + canonical_hostname('code.org')
  end

  def teacher_dashboard_url
    "//#{canonical_hostname('code.org')}/teacher-dashboard"
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

  def show_image(params)
    level_source = nil
    if params[:id]
      level_source = LevelSource.find(params[:id])
      app = level_source.level.game.app
    else
      app = params[:app]
    end
    
    # playlab/studio and artist/turtle can have images

    level_source_image = LevelSourceImage.find_by_level_source_id(level_source.id) if level_source
    if level_source_image.try(:image)
      url_for(:controller => "level_sources", :action => "generate_image", :id => params[:id], only_path: false)
    elsif app == Game::FLAPPY || app == Game::BOUNCE || app == Game::STUDIO
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

  def playlab_freeplay_path
    script_stage_script_level_path(*is_k1? ? ['course1', 16, 6] : ['playlab', 1, 10])
  end

  def artist_freeplay_path
    script_stage_script_level_path(*is_k1? ? ['course1', 18, 10] : ['artist', 1, 10])
  end
end
