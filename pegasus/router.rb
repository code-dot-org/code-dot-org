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
    Sass::Plugin.options[:cache_location] = pegasus_dir('cache', '.sass-cache')
    Sass::Plugin.options[:css_location] = pegasus_dir('cache', 'css')
    Sass::Plugin.options[:template_location] = shared_dir('css')
    set :mustermann_opts, check_anchors: false, ignore_unknown_options: true

    # Haml/Temple engine doesn't recognize the `path` option
    # which is used by Sinatra/Tilt for correct template backtraces.
    Haml::TempleEngine.disable_option_validator!
  end

  # Capture the current request URL for i18n string tracking
  before do
    Thread.current[:current_request_url] = request.url
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

    @actionview ||= begin
      # Lazily require actionview_sinatra here, because it it turn will require
      # ActionView::Base, which will in turn run the ActiveSupport load hooks for
      # the class.
      #
      # This can cause some issues for environments that want to load both
      # Pegasus and Dashboard, since if ActionView is loaded outside the context
      # of Rails it won't load all functionality, and ActionView won't be
      # re-initialized when it _does_ get loaded by Rails.
      #
      # This is similar to the lazy loading we need to do for Haml:
      # https://github.com/code-dot-org/code-dot-org/blob/8a49e0f39e1bc98aac462a3eb049d0eeb6af3e06/lib/cdo/pegasus/text_render.rb#L82-L97
      require 'cdo/pegasus/actionview_sinatra'
      ActionViewSinatra::Base.new(self)
    end

    update_actionview_assigns
    @actionview.instance_variable_set("@_request", request)
  end

  # This will make all instance variables on our sinatra controller also
  # available from our views. Inspired by similar behavior in Rails' controller
  # logic:
  # https://github.com/rails/rails/blob/c4d3e202e10ae627b3b9c34498afb45450652421/actionpack/lib/abstract_controller/rendering.rb#L66-L77
  #
  # If in the future Sinatra's controller functionality is replaced by Rails,
  # this can probably go away.
  def update_actionview_assigns
    view_assigns = {}
    instance_variables.each do |name|
      view_assigns[name[1..-1]] = instance_variable_get(name)
    end
    @actionview.assign(view_assigns)
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

    if params.key?('embedded') && @header['embedded_theme']
      @header['theme'] = @header['embedded_theme']
      @header['layout'] = 'none'
      response.headers['X-Frame-Options'] = 'ALLOWALL'
    end

    if @header['content-type']
      response.headers['Content-Type'] = @header['content-type']
    end
    layout = @header['layout'] || 'default'
    unless ['', 'none'].include?(layout)
      template = resolve_template('layouts', settings.template_extnames, layout)
      raise Exception, "'#{layout}' layout not found." unless template
      body render_template(template, {body: body.join('').html_safe})
    end

    theme = @header['theme'] || 'default'
    unless ['', 'none'].include?(theme)
      template = resolve_template('themes', settings.template_extnames, theme)
      raise Exception, "'#{theme}' theme not found." unless template
      body render_template(template, {body: body.join('').html_safe})
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
      return nil if (id = dashboard_user_id).nil?
      @dashboard_user ||= Dashboard.db[:users][id: id]
    end

    # Get the current dashboard user wrapped in a helper
    # @returns [Dashboard::User] or nil if not signed in
    #
    # TODO: When we are using this everywhere, rename to just `dashboard_user`
    def dashboard_user_helper
      return nil if (id = dashboard_user_id).nil?
      @dashboard_user_helper ||= Dashboard::User.get(id)
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

      header = YAML.load(match[:yaml], path) || {}
      raise "YAML header error: expected Hash, not #{header.class}" unless header.is_a?(Hash)

      remaining_content = match.post_match
      line = content.lines.count - remaining_content.lines.count + 1
      [header, remaining_content, line]
    rescue => e
      # Append rendered header to error message.
      e.message << "\n#{match[:yaml]}" if match[:yaml]
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
      render_(content, path, line)
    rescue => e
      # Add document path to backtrace if not already included.
      if path && [e.message, *e.backtrace].none? {|location| location.include?(path)}
        e.set_backtrace e.backtrace.unshift(path)
      end
      raise
    end

    def render_partials(template_content)
      # Template types that do not have thier own way of rendering partials
      # (ie, markdown) can include other partials with the syntax:
      #
      #     {{ path/to/partial }}
      #
      # Because such content can be translated, we want to make sure that if a
      # translator accidentally translates the path to the template, we simply
      # render nothing rather than throwing an error
      template_content.
        gsub(/{{([^}]*)}}/) do
          view($1.strip)
        rescue
          ''
        end
    end

    def resolve_static(subdir, uri)
      return nil if MultipleExtnameFileUtils.file_has_any_extnames(uri, settings.non_static_extnames)

      @dirs.each do |dir|
        path = content_dir(dir, subdir, uri)
        if File.file?(path)
          return path
        end
      end
      nil
    end

    def resolve_template(subdir, extnames, uri, is_document = false)
      dirs = is_document ? @dirs - [@config[:base_no_documents]] : @dirs
      dirs.each do |dir|
        found = MultipleExtnameFileUtils.find_with_extnames(content_dir(dir, subdir), uri, extnames)
        return found.first unless found.empty?
      end

      # Also look for shared items.
      found = MultipleExtnameFileUtils.find_with_extnames(content_dir('..', '..', 'shared', 'haml'), uri, extnames)
      return found.first unless found.empty?
    end

    # Scans the filesystem and finds all documents served by Pegasus CMS.
    # @return [Array<Hash<Symbol, String>] An array of :site, :uri hash entries for all found documents.
    def all_documents
      dirs = (Dir.entries(content_dir) - ['.', '..']).select {|file| Dir.exist?(content_dir(file))}
      dirs.map do |site|
        site_glob = site_sub = content_dir(site, 'public')

        next if site == 'drupal.code.org'
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
            sub(/(#{settings.template_extnames.join('|')})*$/, '').
            sub(/\/index$/, '')

          # hourofcode.com has custom logic to resolve `/:country/:language/:path` URIs to
          # `/:language/:path` document paths, so prepend default `us` country code to reduce document path to URI.
          uri.prepend('/us') if site == 'hourofcode.com'

          {site: site, uri: uri}
        end
      end.flatten.compact
    end

    def resolve_document(uri)
      # Find the template representing this URI using the following logic:
      #
      #   1. If a locale-specific template exists at the file indicated by the URI, return that
      #   2. If a locale-specific template called "index" exists in the directory indicated by the URI, return that
      #   3. If a default template exists at the file indicated by the URI, return that
      #   4. If a default template called "index" exists in the directory indicated by the URI, return that
      #   5. If a splat template exists anywhere in the directory structure indicated by the URI, return that
      #   6. We could not find a template

      # Steps 1-4: Try to find the relevant template
      paths = [
        "#{uri}.#{request.locale}",
        File.join(uri, "index.#{request.locale}"),
        uri,
        File.join(uri, "index")
      ]
      paths.each do |path|
        template = resolve_template('public', settings.non_static_extnames, path, true)
        return template if template
      end

      # Step 5: Recursively resolve '/splat.[ext]' template from the given URI.
      # env[:splat_path_info] contains the path_info following the splat template's folder.
      at = uri
      while at != '/'
        parent = File.dirname(at)

        path = resolve_template('public', settings.non_static_extnames, File.join(parent, 'splat'), true)
        if path
          request.env[:splat_path_info] = uri[parent.length..-1]
          return path
        end

        at = parent
      end

      # Step 6: failure
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
      render_(IO.read(path), path, 0, locals)
    rescue => e
      Honeybadger.context({path: path, e: e})
      raise "Error rendering #{path}: #{e}"
    end

    def render_(body, path=nil, line=0, locals={})
      extensions = MultipleExtnameFileUtils.all_extnames(path)

      # Now, apply the processing operations implied by each extension to the
      # given file, in an "outside-in" order
      # IE, "foo.md.erb" will be processed as an ERB template, then the result
      # of that will be processed as a MD template
      result = body
      extensions.reverse.each do |extension|
        case extension
        when '.erb', '.html', '.haml', '.md'
          # Symbolize the keys of the locals hash; previously, we supported
          # using either symbols or strings in locals hashes but ActionView
          # only allows symbols.
          result = @actionview.render(inline: result, type: extension[1..-1], locals: locals.symbolize_keys)
        when '.fetch'
          cache_file = cache_dir('fetch', request.site, request.path_info)
          unless File.file?(cache_file) && File.mtime(cache_file) > settings.launched_at
            FileUtils.mkdir_p File.dirname(cache_file)
            IO.binwrite(cache_file, Net::HTTP.get(URI(result)))
          end
          pass unless File.file?(cache_file)

          cache :static
          result = send_file(cache_file)
        when '.partial'
          result = render_partials(result)
        when '.redirect', '.moved', '.301'
          result = redirect result, 301
        when '.found', '.302'
          result = redirect result, 302
        end
      end

      result
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
