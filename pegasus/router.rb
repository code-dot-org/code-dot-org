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
    set :template_extnames, ['.erb', '.haml', '.html', '.md', '.txt']
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

    locale = request.locale
    locale = 'it-IT' if request.site == 'italia.code.org'
    locale = 'es-ES' if request.site == 'ar.code.org'
    locale = 'ro-RO' if request.site == 'ro.code.org'
    locale = 'pt-BR' if request.site == 'br.code.org'
    I18n.locale = locale

    @config = settings.configs[request.site]
    @header = {}

    @dirs = []

    if request.site == 'hourofcode.com'
      @dirs << [File.join(request.site, 'i18n')]
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
    not_found! if settings.not_found_extnames.include?(File.extname(path))
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
    def content_dir(*paths)
      File.join(settings.views, *paths)
    end

    # Get the current dashboard user record
    # @returns [Hash]
    #
    # TODO: Switch to using `dashboard_user_helper` everywhere and remove this
    def dashboard_user
      @dashboard_user ||= Dashboard.db[:users][id: dashboard_user_id]
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

    def parse_yaml_header(path)
      content = IO.read path
      match = content.match(/\A\s*^(?<yaml>---\s*\n.*?\n?)^(---\s*$\n?)/m)
      return [{}, content, 1] unless match

      yaml = erb(match[:yaml], path: path, line: 1)
      header = YAML.load(yaml, path) || {}
      raise "YAML header error: expected Hash, not #{header.class}" unless header.is_a?(Hash)
      remaining_content = match.post_match
      line = content.lines.count - remaining_content.lines.count + 1
      [header, remaining_content, line]
    rescue => e
      # Append rendered header to error message.
      e.message << "\n#{yaml}" if yaml
      raise
    end

    def document(path)
      header, content, line = parse_yaml_header(path)
      @header.merge!(header)
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
      render_(content, File.extname(path), path, line)
    rescue => e
      # Add document path to backtrace if not already included.
      if path && [e.message, *e.backtrace].none? {|location| location.include?(path)}
        e.set_backtrace e.backtrace.unshift(path)
      end
      raise
    end

    def preprocess_markdown(markdown_content)
      markdown_content.gsub(/```/, "```\n")
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

    def resolve_template(subdir, extnames, uri, is_document = false)
      dirs = is_document ? @dirs - [@config[:base_no_documents]] : @dirs
      dirs.each do |dir|
        extnames.each do |extname|
          path = content_dir(dir, subdir, "#{uri}#{extname}")
          if File.file?(path)
            log_drupal_link(dir, "#{uri}#{extname}", path)
            return path
          end
        end
      end

      # Also look for shared items.
      extnames.each do |extname|
        path = content_dir('..', '..', 'shared', 'haml', "#{uri}#{extname}")
        if File.file?(path)
          return path
        end
      end

      nil
    end

    # Scans the filesystem and finds all documents served by Pegasus CMS.
    # @return [Array<Hash<Symbol, String>] An array of :site, :uri hash entries for all found documents.
    def all_documents
      dirs = (Dir.entries(content_dir) - ['.', '..']).select {|file| Dir.exist?(content_dir(file))}
      dirs.map do |site|
        site_glob = site_sub = content_dir(site, 'public')

        if site == 'hourofcode.com'
          # hourofcode.com has custom logic to include
          # optional `/i18n` folder in its file-search path.
          site_glob.sub!(site, "{#{site},#{site}/i18n}")
          site_sub = /#{content_dir(site)}(\/i18n)?\/public/
        end

        Dir.glob("#{site_glob}/**/*{#{settings.template_extnames.join(',')}}").map do |file|
          # Reduce file to URI.
          uri = file.
            sub(site_sub, '').
            sub(/#{File.extname(file)}$/, '').
            sub(/\/index$/, '')

          # hourofcode.com has custom logic to resolve `/:country/:language/:path` URIs to
          # `/:language/:path` document paths, so prepend default `us` country code to reduce document path to URI.
          uri.prepend('/us') if site == 'hourofcode.com'

          {site: site, uri: uri}
        end
      end.flatten.compact
    end

    def resolve_document(uri)
      extnames = settings.non_static_extnames

      path = resolve_template('public', extnames, uri, true)
      return path if path

      path = resolve_template('public', extnames, File.join(uri, 'index'), true)
      return path if path

      # Recursively resolve '/splat.[ext]' template from the given URI.
      # env[:splat_path_info] contains the path_info following the splat template's folder.
      at = uri
      while at != '/'
        parent = File.dirname(at)

        path = resolve_template('public', extnames, File.join(parent, 'splat'), true)
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
      render_(IO.read(path), File.extname(path), path, 0, locals)
    rescue => e
      Honeybadger.context({path: path, e: e})
      raise "Error rendering #{path}: #{e}"
    end

    def render_(body, extname, path=nil, line=0, locals={})
      locals = @locals.merge(locals).symbolize_keys
      options = {locals: locals, line: line, path: path}

      case extname
      when '.erb', '.html'
        erb body, options
      when '.haml'
        haml body, options
      when '.fetch'
        url = erb(body, options)

        cache_file = cache_dir('fetch', request.site, request.path_info)
        unless File.file?(cache_file) && File.mtime(cache_file) > settings.launched_at
          FileUtils.mkdir_p File.dirname(cache_file)
          IO.binwrite(cache_file, Net::HTTP.get(URI(url)))
        end
        pass unless File.file?(cache_file)

        cache :static
        send_file(cache_file)
      when '.md', '.txt'
        preprocessed = erb body, options
        preprocessed = preprocess_markdown preprocessed
        markdown preprocessed, options
      when '.redirect', '.moved', '.301'
        redirect erb(body, options), 301
      when '.found', '.302'
        redirect erb(body, options), 302
      else
        raise "'#{extname}' isn't supported."
      end
    end

    def social_metadata
      metadata =
        if request.site == 'csedweek.org'
          {'og:site_name' => 'CSEd Week'}
        else
          {'og:site_name' => 'Code.org'}
        end

      # Metatags common to all sites.
      metadata['og:title'] = @header['title'] unless @header['title'].nil_or_empty?
      metadata['og:description'] = @header['description'] unless @header['description'].nil_or_empty?
      metadata['fb:app_id'] = '500177453358606'
      metadata['og:type'] = 'article'
      metadata['article:publisher'] = 'https://www.facebook.com/Code.org'
      metadata['og:url'] = request.url

      (@header['social'] || {}).each_pair do |key, value|
        if value == ""
          metadata.delete(key)
        else
          metadata[key] = value
        end
      end

      # A few pages have specific metadata defined here.
      metadata.merge! get_social_metadata_for_page(request)

      if request.site != 'csedweek.org'
        unless metadata['og:image']
          metadata['og:image'] = CDO.code_org_url('/images/default-og-image.png', 'https:')
          metadata['og:image:width'] = 1220
          metadata['og:image:height'] = 640
        end
        unless metadata['twitter:image:src']
          metadata['twitter:image:src'] = CDO.code_org_url('/images/default-og-image.png', 'https:')
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
