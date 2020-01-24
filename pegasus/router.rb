require_relative 'src/env'
require 'rack'
require 'cdo/rack/locale'
require 'sinatra/base'
require 'sinatra/verbs'
require 'cdo/sinatra'
require 'cdo/geocoder'
require 'cdo/pegasus/graphics'
require 'cdo/rack/cdo_deflater'
require 'cdo/rack/request'
require 'cdo/properties'
require 'cdo/languages'
require 'dynamic_config/page_mode'
require 'active_support'
require 'base64'
require 'cgi'
require 'json'
require 'uri'
require 'cdo/rack/upgrade_insecure_requests'
require_relative 'helper_modules/dashboard'
require 'dynamic_config/dcdo'
require 'active_support/core_ext/hash'
require 'sass'
require 'sass/plugin'
require 'haml'

if rack_env?(:production)
  require 'newrelic_rpm'
  # Enable GC profiler for New Relic instrumentation.
  GC::Profiler.enable
  NewRelic::Agent.after_fork(force_reconnect: true)
end

require 'honeybadger'

require src_dir 'database'
require src_dir 'social_metadata'
require src_dir 'forms'
require src_dir 'curriculum_router'
require src_dir 'homepage'
require src_dir 'advocacy_site'
require 'cdo/hamburger'

require pegasus_dir 'helper_modules/multiple_extname_file_utils'

def http_vary_add_type(vary, type)
  types = vary.to_s.split(',').map(&:strip)
  return vary if types.include?('*') || types.include?(type)
  types.push(type).join(',')
end

class Documents < Sinatra::Base
  def self.get_head_or_post(url, &block)
    get(url, &block)
    head(url, &block)
    post(url, &block)
  end

  def self.load_config_in(dir)
    path = File.join(dir, 'config.json')
    return {} unless File.file?(path)
    JSON.parse(IO.read(path), symbolize_names: true)
  end

  def self.load_configs_in(dir)
    configs = {}

    Dir.entries(dir).each do |site|
      site_dir = File.join(dir, site)
      next if site == '.' || site == '..' || !File.directory?(site_dir)
      configs[site] = load_config_in(site_dir)
    end

    configs
  end

  use Rack::Locale
  use Rack::CdoDeflater
  use Rack::UpgradeInsecureRequests

  # Use dynamic config for max_age settings, with the provided default as fallback.
  def self.set_max_age(type, default)
    default = 60 if rack_env? :staging
    default = 0 if rack_env? :development
    set "#{type}_max_age", proc {DCDO.get("pegasus_#{type}_max_age", default)}
  end

  ONE_HOUR = 3600

  configure do
    dir = pegasus_dir('sites.v3')
    set :launched_at, Time.now
    set :configs, load_configs_in(dir)
    set :views, dir
    set :image_extnames, ['.png', '.jpeg', '.jpg', '.gif']
    set :exclude_extnames, ['.collate']
    set_max_age :document, ONE_HOUR * 4
    set_max_age :document_proxy, ONE_HOUR * 2
    set_max_age :image, ONE_HOUR * 10
    set_max_age :image_proxy, ONE_HOUR * 5
    set_max_age :static, ONE_HOUR * 10
    set_max_age :static_proxy, ONE_HOUR * 5
    set :read_only, CDO.read_only
    set :not_found_extnames, ['.not_found', '.404']
    set :redirect_extnames, ['.redirect', '.moved', '.found', '.301', '.302']
    set :template_extnames, ['.erb', '.haml', '.html', '.md', '.partial']
    set :non_static_extnames,
      settings.not_found_extnames +
      settings.redirect_extnames +
      settings.template_extnames +
      settings.exclude_extnames +
      ['.fetch']
    set :markdown,
      renderer: ::TextRender::MarkdownEngine::HTMLWithDivBrackets,
      autolink: true,
      tables: true,
      space_after_headers: true,
      fenced_code_blocks: true,
      lax_spacing: true
    Sass::Plugin.options[:cache_location] = pegasus_dir('cache', '.sass-cache')
    Sass::Plugin.options[:css_location] = pegasus_dir('cache', 'css')
    Sass::Plugin.options[:template_location] = shared_dir('css')
    set :mustermann_opts, check_anchors: false, ignore_unknown_options: true

    # Haml/Temple engine doesn't recognize the `path` option
    # which is used by Sinatra/Tilt for correct template backtraces.
    Haml::TempleEngine.disable_option_validator!
  end

  before do
    $log.debug request.url

    Honeybadger.context({url: request.url, locale: request.locale})

    uri = request.path_info.chomp('/')
    redirect uri unless uri.empty? || request.path_info == uri

    I18n.locale = request.locale

    @config = settings.configs[request.site]
    @header = {}

    @dirs = []

    if request.site == 'hourofcode.com'
      @dirs << [File.join(request.site, 'i18n')]
    end

    if request.site == 'code.org'
      @dirs << File.join(request.site, 'i18n')
    end

    @dirs << request.site

    # Implement recursive site-inheritance feature.
    # Site renders fallback documents from 'base' site defined in config.
    if @config
      base = @config[:base]
      while base
        @dirs << base
        base = settings.configs[base][:base]
      end
    end

    @locals = {header: @header}
  end

  # Language selection
  get %r{^/lang/([^/]+)/?(.*)?$} do
    lang, path = params[:captures]
    pass unless DB[:cdo_languages].first(code_s: lang)
    dont_cache
    response.set_cookie('language_', {value: lang, domain: ".#{request.site}", path: '/', expires: Time.now + (365 * 24 * 3600)})
    redirect "/#{path}"
  end

  # Page mode selection
  get '/private/pm/*' do |page_mode|
    dont_cache
    response.set_cookie('pm', {value: page_mode, domain: ".#{request.site}", path: '/', expires: Time.now + (7 * 24 * 3600)})
    redirect "/learn?r=#{rand(100000)}"
  end

  # /private (protected area)
  ['/private', '/private/*'].each do |uri|
    get_head_or_post uri do
      unless rack_env?(:development)
        not_authorized! unless dashboard_user_helper
        forbidden! unless dashboard_user_helper.admin?
      end
      pass
    end
  end

  # Static files
  get '*' do |uri|
    pass unless path = resolve_static('public', uri)
    cache :static
    NewRelic::Agent.set_transaction_name(uri) if defined? NewRelic
    send_file(path)
  end

  get '/style.css' do
    content_type :css
    css, digest = combine_css 'styles', 'styles_min'
    etag digest
    cache :static
    css
  end

  # rubocop:disable Security/Eval
  Dir.glob(pegasus_dir('routes/*.rb')).sort.each {|path| eval(IO.read(path), nil, path, 1)}
  unless rack_env?(:production)
    Dir.glob(pegasus_dir('routes/dev/*.rb')).sort.each {|path| eval(IO.read(path), nil, path, 1)}
  end
  # rubocop:enable Security/Eval

  # Manipulated images
  get '/images/*' do |path|
    path = File.join('/images', path)
    image_data = process_image(path, settings.image_extnames, @language, request.site)
    pass if image_data.nil?
    last_modified image_data[:last_modified]
    content_type image_data[:content_type]
    cache :image
    send_file(image_data[:file]) if image_data[:file]
    image_data[:content]
  end

  # Documents
  get_head_or_post '*' do |uri|
    pass unless path = resolve_document(uri)
    if defined? NewRelic
      transaction_name = uri
      transaction_name = transaction_name.sub(request.env[:splat_path_info], '') if request.env[:splat_path_info]
      NewRelic::Agent.set_transaction_name(transaction_name)
    end
    not_found! if MultipleExtnameFileUtils.file_has_any_extnames(path, settings.not_found_extnames)
    document path
  end

  after do
    return unless response.headers['X-Pegasus-Version'] == '3'
    return unless ['', 'text/html'].include?(response.content_type.to_s.split(';', 2).first.to_s.downcase)

    if params.key?('embedded') && @locals[:header]['embedded_layout']
      @locals[:header]['layout'] = @locals[:header]['embedded_layout']
      @locals[:header]['theme'] ||= 'none'
      response.headers['X-Frame-Options'] = 'ALLOWALL'
    end

    if @locals[:header]['content-type']
      response.headers['Content-Type'] = @locals[:header]['content-type']
    end
    layout = @locals[:header]['layout'] || 'default'
    unless ['', 'none'].include?(layout)
      template = resolve_template('layouts', settings.template_extnames, layout)
      raise Exception, "'#{layout}' layout not found." unless template
      body render_template(template, @locals.merge({body: body.join('')}))
    end

    theme = @locals[:header]['theme'] || 'default'
    unless ['', 'none'].include?(theme)
      template = resolve_template('themes', settings.template_extnames, theme)
      raise Exception, "'#{theme}' theme not found." unless template
      body render_template(template, @locals.merge({body: body.join('')}))
    end
  end

  not_found do
    status 404
    path = resolve_template('views', settings.template_extnames, '/404')
    document(path).tap {dont_cache} if path
  end

  helpers(Dashboard) do
    # Load helpers
    load pegasus_dir('helpers.rb')
  end

  use CurriculumRouter
end
