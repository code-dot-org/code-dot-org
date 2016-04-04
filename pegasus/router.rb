require_relative 'src/env'
require 'rack'
require 'rack/contrib'
require 'sinatra/base'
require 'sinatra/verbs'
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

if rack_env?(:production)
  require 'newrelic_rpm'
  NewRelic::Agent.after_fork(force_reconnect: true)
  require 'honeybadger'
end

require src_dir 'database'
require src_dir 'forms'
require src_dir 'curriculum_router'

def http_vary_add_type(vary,type)
  types = vary.to_s.split(',').map(&:strip)
  return vary if types.include?('*') || types.include?(type)
  types.push(type).join(',')
end

class Documents < Sinatra::Base

  def self.get_head_or_post(url,&block)
    get(url,&block)
    head(url,&block)
    post(url,&block)
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

  use Honeybadger::Rack if rack_env?(:production)
  use Rack::Locale
  use Rack::CdoDeflater
  use Rack::UpgradeInsecureRequests

  # Use dynamic config for max_age settings, with the provided default as fallback.
  def self.set_max_age(type, default)
    default = 60 if rack_env? :staging
    default = 0 if rack_env? :development
    set "#{type}_max_age", Proc.new { DCDO.get("pegasus_#{type}_max_age", default) }
  end

  ONE_HOUR = 3600

  configure do
    dir = pegasus_dir('sites.v3')
    set :launched_at, Time.now
    set :configs, load_configs_in(dir)
    set :views, dir
    set :image_extnames, ['.png','.jpeg','.jpg','.gif']
    set :exclude_extnames, ['.collate']
    set_max_age :document, ONE_HOUR * 4
    set_max_age :document_proxy, ONE_HOUR * 2
    set_max_age :image, ONE_HOUR * 10
    set_max_age :image_proxy, ONE_HOUR * 5
    set_max_age :static, ONE_HOUR * 10
    set_max_age :static_proxy, ONE_HOUR * 5
    set :read_only, CDO.read_only
    set :not_found_extnames, ['.not_found','.404']
    set :redirect_extnames, ['.redirect','.moved','.found','.301','.302']
    set :template_extnames, ['.erb','.fetch','.haml','.html','.md','.txt']
    set :non_static_extnames, settings.not_found_extnames + settings.redirect_extnames + settings.template_extnames + settings.exclude_extnames
    set :markdown, {autolink: true, tables: true, space_after_headers: true, fenced_code_blocks: true}

    if rack_env?(:production)
      Honeybadger.configure do |config|
        config.api_key = CDO.pegasus_honeybadger_api_key
        config.ignore << 'Sinatra::NotFound'
        config.ignore << 'Table::NotFound'
      end
    end
  end

  before do
    $log.debug request.url

    uri = request.path_info.chomp('/')
    redirect uri unless uri.empty? || request.path_info == uri

    locale = request.locale
    locale = 'it-IT' if request.site == 'italia.code.org'
    locale = 'es-ES' if request.site == 'ar.code.org'
    locale = 'ro-RO' if request.site == 'ro.code.org'
    locale = 'pt-BR' if request.site == 'br.code.org'
    I18n.locale = locale

    @config = settings.configs[request.site]
    @header = {}

    @dirs = []

    if ['hourofcode.com', 'translate.hourofcode.com'].include?(request.site)
      @dirs << [File.join(request.site, 'i18n')]
    end

    @dirs << request.site

    if @config
      base = @config[:base]
      while base
        @dirs << base
        base = settings.configs[base][:base]
      end
    end

    @locals = {header: {}}
  end

  # Language selection
  get %r{^/lang/([^/]+)/?(.*)?$} do
    lang, path = params[:captures]
    pass unless DB[:cdo_languages].first(code_s: lang)
    dont_cache
    response.set_cookie('language_', {value: lang, domain: ".#{request.site}", path: '/', expires: Time.now + (365*24*3600)})
    redirect "/#{path}"
  end

  # Page mode selection
  get '/private/pm/*' do |page_mode|
    dont_cache
    response.set_cookie('pm', {value: page_mode, domain: ".#{request.site}", path: '/'})
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
    send_file(path)
  end

  get '/style.css' do
    content_type :css
    css_last_modified = Time.at(0)
    css = Dir.glob(pegasus_dir('sites.v3',request.site,'/styles/*.css')).sort.map do |i|
      css_last_modified = [css_last_modified, File.mtime(i)].max
      IO.read(i)
    end.join("\n\n")
    last_modified(css_last_modified) if css_last_modified > Time.at(0)
    cache :static
    css
  end

  # rubocop:disable Lint/Eval
  Dir.glob(pegasus_dir('routes/*.rb')).sort.each{|path| eval(IO.read(path))}
  # rubocop:enable Lint/Eval

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
    not_found! if settings.not_found_extnames.include?(File.extname(path))
    document path
  end

  after do
    return unless response.headers['X-Pegasus-Version'] == '3'
    return unless ['', 'text/html'].include?(response.content_type.to_s.split(';', 2).first.to_s.downcase)

    if params.has_key?('embedded') && @locals[:header]['embedded_layout']
      @locals[:header]['layout'] = @locals[:header]['embedded_layout']
      @locals[:header]['theme'] ||= 'none'
      response.headers['X-Frame-Options'] = 'ALLOWALL'
    end

    if @locals[:header]['content-type']
      response.headers['Content-Type'] = @locals[:header]['content-type']
    end
    layout = @locals[:header]['layout']||'default'
    unless ['', 'none'].include?(layout)
      template = resolve_template('layouts', settings.template_extnames, layout)
      raise Exception, "'#{layout}' layout not found." unless template
      body render_template(template, @locals.merge({body: body.join('')}))
    end

    theme = @locals[:header]['theme']||'default'
    unless ['', 'none'].include?(theme)
      template = resolve_template('themes', settings.template_extnames, theme)
      raise Exception, "'#{theme}' theme not found." unless template
      body render_template(template, @locals.merge({body: body.join('')}))
    end
  end

  not_found do
    status 404
    path = resolve_template('views', settings.template_extnames, '/404')
    document(path).tap{dont_cache}
  end

  helpers(Dashboard) do
    def content_dir(*paths)
      File.join(settings.views, *paths)
    end

    # Get the current dashboard user record
    # @returns [Hash]
    #
    # TODO: Switch to using `dashboard_user_helper` everywhere and remove this
    def dashboard_user
      @dashboard_user ||= Dashboard::db[:users][id: dashboard_user_id]
    end

    # Get the current dashboard user wrapped in a helper
    # @returns [Dashboard::User] or nil if not signed in
    #
    # TODO: When we are using this everywhere, rename to just `dashboard_user`
    def dashboard_user_helper
      @dashboard_user_helper ||= Dashboard::User.get(dashboard_user_id)
    end

    # Get the current dashboard user ID
    # @returns [Integer]
    def dashboard_user_id
      request.user_id
    end

    def document(path)
      content = IO.read(path)
      original_line_count = content.lines.count
      match = content.match(/^(?<yaml>---\s*\n.*?\n?)^(---\s*$\n?)/m)
      if match
        @header = @locals[:header] = YAML.load(render_(match[:yaml], '.erb'))
        content = match.post_match
      end
      line_number_offset = content.lines.count - original_line_count
      @header['social'] = social_metadata

      if @header['require_https'] && rack_env == :production
        headers['Vary'] = http_vary_add_type(headers['Vary'], 'X-Forwarded-Proto')
        redirect request.url.sub('http://', 'https://') unless request.env['HTTP_X_FORWARDED_PROTO'] == 'https'
      end

      if @header['max_age']
        cache_for @header['max_age']
      else
        cache :document
      end

      if request.post? && !@header['allow_post']
        response.headers['Allow'] = 'GET, HEAD'
        error 405
      end

      response.headers['X-Pegasus-Version'] = '3'
      begin
        render_(content, File.extname(path))
      rescue Haml::Error => e
        if e.backtrace.first =~ /router\.rb:/ && e.line
          actual_line_number = e.line - line_number_offset + 1
          e.set_backtrace e.backtrace.unshift("#{path}:#{actual_line_number}")
        end
        raise e
      end
    end

    def preprocess_markdown(markdown_content)
      markdown_content.gsub(/```/, "```\n")
    end

    def post_process_html_from_markdown(full_document)
      full_document.gsub!(/<p>\[\/(.*)\]<\/p>/) do
        "</div>"
      end
      full_document.gsub!(/<p>\[(.*)\]<\/p>/) do
        value = $1
        if value[0] == '#'
          attribute = 'id'
          value = value[1..-1]
        else
          attribute = 'class'
        end

        "<div #{attribute}='#{value}'>"
      end
      full_document
    end

    def log_drupal_link(dir, uri, path)
      if dir == 'drupal.code.org'
        Honeybadger.notify(
          error_class: "Link to v3.sites/drupal.code.org",
          error_message: "#{uri} fell through to the base config directory",
          environment_name: "drupal_#{rack_env}",
          context: {path: path}
        )
      end
    end

    def resolve_static(subdir, uri)
      return nil if settings.non_static_extnames.include?(File.extname(uri))

      @dirs.each do |dir|
        path = content_dir(dir, subdir, uri)
        if File.file?(path)
          log_drupal_link(dir, uri, path)
          return path
        end
      end
      nil
    end

    def resolve_template(subdir, extnames, uri)
      @dirs.each do |dir|
        extnames.each do |extname|
          path = content_dir(dir, subdir, "#{uri}#{extname}")
          if File.file?(path)
            log_drupal_link(dir, "#{uri}#{extname}", path)
            return path
          end
        end
      end
      nil
    end

    def resolve_document(uri)
      extnames = settings.non_static_extnames

      path = resolve_template('public', extnames, uri)
      return path if path

      path = resolve_template('public', extnames, File.join(uri, 'index'))
      return path if path

      at = uri
      while at != '/'
        parent = File.dirname(at)

        path = resolve_template('public', extnames, File.join(parent, 'splat'))
        if path
          request.env[:splat_path_info] = uri[parent.length..-1]
          return path
        end

        at = parent
      end

      nil
    end

    def resolve_image(uri)
      settings.image_extnames.each do |extname|
        file_path = resolve_static('public', "#{uri}#{extname}")
        return file_path if file_path
      end
      nil
    end

    def render_template(path, locals={})
      render_(IO.read(path), File.extname(path), locals)
    rescue Haml::Error => e
      if e.backtrace.first =~ /router\.rb:/
        e.set_backtrace e.backtrace.unshift("#{path}:#{e.line}")
      end
      raise e
    end

    def render_(body, extname, locals={})
      locals = @locals.merge(locals)
      case extname
      when '.erb', '.html'
        erb body, locals: locals
      when '.haml'
        haml body, locals: locals
      when '.fetch'
        url = erb(body, locals: locals)

        cache_file = cache_dir('fetch', request.site, request.path_info)
        unless File.file?(cache_file) && File.mtime(cache_file) > settings.launched_at
          FileUtils.mkdir_p File.dirname(cache_file)
          IO.binwrite(cache_file, Net::HTTP.get(URI(url)))
        end
        pass unless File.file?(cache_file)

        cache :static
        send_file(cache_file)
      when '.md', '.txt'
        preprocessed = erb body, locals: locals
        preprocessed = preprocess_markdown preprocessed
        html = markdown preprocessed, locals: locals
        post_process_html_from_markdown html
      when '.redirect', '.moved', '.301'
        redirect erb(body, locals: locals), 301
      when '.found', '.302'
        redirect erb(body, locals: locals), 302
      else
        raise "'#{extname}' isn't supported."
      end
    end

    def social_metadata()
      if request.site == 'csedweek.org'
        metadata = {
          'og:site_name'      => 'CSEd Week',
        }
      else
        metadata = {
          'og:site_name'      => 'Code.org'
        }
      end

      # Metatags common to all sites.
      metadata['og:title'] = @header['title'] unless @header['title'].nil_or_empty?
      metadata['og:description'] = @header['description'] unless @header['description'].nil_or_empty?
      metadata['fb:app_id'] = '500177453358606'
      metadata['og:type'] = 'article'
      metadata['article:publisher'] = 'https://www.facebook.com/Code.org'
      metadata['og:url'] = request.url

      (@header['social']||{}).each_pair do |key, value|
        if value == ""
          metadata.delete(key)
        else
          metadata[key] = value
        end
      end

      if !metadata['og:image']
        if request.site != 'csedweek.org'
          metadata['og:image'] = CDO.code_org_url('/images/default-og-image.png', 'https:')
          metadata['og:image:width'] = 1220
          metadata['og:image:height'] = 640
        end
      end

      metadata
    end

    def view(uri, locals={})
      path = resolve_template('views', settings.template_extnames, uri.to_s)
      raise "View '#{uri}' not found." unless path
      render_template(path, locals)
    end

    # Load helpers
    load pegasus_dir('helpers.rb')
  end

  use CurriculumRouter

end
