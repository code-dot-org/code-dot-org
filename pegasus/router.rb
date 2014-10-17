require_relative 'src/env'
require 'rack'
require 'rack/contrib'
require 'sinatra/base'
require 'sinatra/verbs'
require 'cdo/geocoder'
require 'cdo/pegasus/graphics'
require 'cdo/rack/deflater'
require 'cdo/rack/request'
require 'active_support'
require 'base64'
require 'cgi'
require 'json'
require 'uri'

if rack_env?(:production)
  require 'newrelic_rpm'
  NewRelic::Agent.after_fork(force_reconnect: true)
  require 'honeybadger'
end

require src_dir 'database'
require src_dir 'forms'
require src_dir 'poste/api'
require src_dir 'router'

def http_vary_add_type(vary,type)
  types = vary.to_s.split(',').map { |v| v.strip }
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
    JSON.parse(IO.read(path), symbolize_names:true)
  end

  def self.load_configs_in(dir)
    configs = {}

    Dir.entries(dir).each do |site|
      site_dir = File.join(dir, site)
      next if site == '.' or site == '..' or !File.directory?(site_dir)
      configs[site] = load_config_in(site_dir)
    end

    configs
  end

  use Honeybadger::Rack if rack_env?(:production)
  use Rack::Locale
  use Rack::CdoDeflater

  configure do
    $log.info "Hello World, I'm in #{rack_env} mode."

    dir = pegasus_dir('sites.v3')
    set :launched_at, Time.now
    set :configs, load_configs_in(dir)
    set :views, dir
    set :document_max_age, rack_env?(:staging) ? 0 : 3600
    set :image_extnames, ['.png','.jpeg','.jpg','.gif']
    set :exclude_extnames, ['.collate']
    set :image_max_age, rack_env?(:staging) ? 0 : 36000
    set :static_max_age, rack_env?(:staging) ? 0 : 36000
    set :read_only, CDO.read_only
    set :not_found_extnames, ['.not_found','.404']
    set :redirect_extnames, ['.redirect','.moved','.found','.301','.302']
    set :template_extnames, ['.erb','.fetch','.haml','.html','.md','.txt']
    set :non_static_extnames, settings.not_found_extnames + settings.redirect_extnames + settings.template_extnames + settings.exclude_extnames
    set :markdown, {autolink:true, tables:true, space_after_headers:true}

    if rack_env?(:production)
      Honeybadger.configure do |config|
        config.api_key = CDO.pegasus_honeybadger_api_key
        config.ignore << 'Sinatra::NotFound'
      end
    end

    Poste::Message.import_templates

    vary_uris = ['/', '/learn', '/congrats', '/language_test', 
                 '/teacher-dashboard', 
                 '/teacher-dashboard/landing',
                 '/teacher-dashboard/nav',
                 '/teacher-dashboard/section_manage',
                 '/teacher-dashboard/section_progress',
                 '/teacher-dashboard/sections',
                 '/teacher-dashboard/signin_cards',
                 '/teacher-dashboard/student']
    set :vary, { 'X-Varnish-Accept-Language'=>vary_uris, 'Cookie'=>vary_uris }
  end

  before do
    $log.debug request.url

    uri = request.path_info.chomp('/')
    redirect uri unless uri.empty? || request.path_info == uri

    settings.vary.each_pair do |header,pages|
      headers['Vary'] = http_vary_add_type(headers['Vary'], header) if pages.include?(request.path_info)
    end

    I18n.locale = request.locale

    @config = settings.configs[request.site]
    @header = {}

    @dirs = [request.site]

    if @config
      base = @config[:base]
      while base
        @dirs << base
        base = settings.configs[base][:base]
      end
    end

    @locals = {header:{}}
  end

  # Language selection
  get %r{^/lang/([^/]+)/?(.*)?$} do
    lang, path = params[:captures]
    pass unless DB[:cdo_languages].first(code_s:lang)
    cache_control :private, :must_revalidate, max_age:0
    response.set_cookie('language_', {value:lang, domain:".#{request.site}", path:'/', expires:Time.now + (365*24*3600)})
    redirect "/#{path}"
  end

  # /private (protected area)
  ['/private', '/private/*'].each do |uri|
    get_head_or_post uri do
      unless rack_env?(:development)
        not_authorized! unless dashboard_user
        forbidden! unless dashboard_user[:admin]
      end
      pass
    end
  end

  # Manipulated images
  get %r{^\/images\/(fit-|fill-)?(\d+)x?(\d*)(\/.*)$} do |mode, width, height, uri|
    mode    = mode.nil?     ? :resize : mode[0..-2].to_sym
    width   = width.to_i
    height  = height.empty? ? nil     : height.to_i

    extname = File.extname(uri).downcase
    format = extname[1..-1]
    pass unless settings.image_extnames.include?(extname)
    basename = File.basename(uri, extname)
    dirname = File.dirname(uri)
    if basename[-3..-1] == '_x2'
      basename = basename[0..-4]
      width *= 2
      height *= 2 unless height.nil?
    end

    pass unless path = resolve_image("/images/#{dirname}/#{basename}")

    content_type format.to_sym
    cache_control :public, :must_revalidate, max_age:settings.image_max_age

    img = load_manipulated_image(path, mode, width, height)
    img.format = format
    img.to_blob
  end

  # Map /dashboardapi/ to the local dashboard instance.
  if rack_env?(:development)
    get_head_or_post %r{^\/dashboardapi\/?} do
      env = request.env.merge('PATH_INFO'=>request.path_info.gsub('/dashboardapi/', '/api/'))
      document = Pegasus::Proxy.new(server:canonical_hostname('learn.code.org') + ":#{CDO.dashboard_port}", host:'learn.code.org').call(env)
      pass if document.nil?

      status(document.status)
      headers(document.headers)
      body([document.body])
    end
  end

  # Static files
  get '*' do |uri|
    pass unless path = resolve_static('public', uri)
    cache_control :public, :must_revalidate, max_age:settings.static_max_age
    send_file(path)
  end

  get '/style.css' do
    content_type :css
    Dir.glob(pegasus_dir('sites.v3',request.site,'/styles/*.css')).sort.map{|i| IO.read(i)}.join("\n\n")
  end

  Dir.glob(pegasus_dir('routes/*.rb')).sort.each{|path| puts(path); eval(IO.read(path))}

  # Documents
  get_head_or_post '*' do |uri|
    pass unless path = resolve_document(uri)
    not_found! if settings.not_found_extnames.include?(File.extname(path))
    document path
  end

  after do
    return unless response.headers['X-Pegasus-Version'] == '3'
    return unless ['', 'text/html'].include?(response.content_type.to_s.split(';', 2).first.to_s.downcase)

    layout = @locals[:header]['layout']||'default'
    unless ['', 'none'].include?(layout)
      template = resolve_template('layouts', settings.template_extnames, layout)
      raise Exception, "'#{layout}' layout not found." unless template
      body render_template(template, @locals.merge({body:body.join('')}))
    end

    theme = @locals[:header]['theme']||'default'
    unless ['', 'none'].include?(theme)
      template = resolve_template('themes', settings.template_extnames, theme)
      raise Exception, "'#{theme}' theme not found." unless template
      body render_template(template, @locals.merge({body:body.join('')}))
    end
  end

  not_found do
    #slog(tag: :not_found, method: request.request_method, uri: request.path_info, site: request.site)
    status 404
    path = resolve_template('views', settings.template_extnames, '/404')
    document path
  end

  helpers do
    def content_dir(*paths)
      File.join(settings.views, *paths)
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
        cache_control :public, :must_revalidate, max_age:@header['max_age']
      else
        cache_control :public, :must_revalidate, max_age:settings.document_max_age
      end

      response.headers['X-Pegasus-Version'] = '3'
      begin
        render_(content, File.extname(path))
      rescue Haml::Error => e
        if e.backtrace.first =~ /router\.rb:/
          actual_line_number = e.line - line_number_offset + 1
          e.set_backtrace e.backtrace.unshift("#{path}:#{actual_line_number}")
        end
        raise e
      end
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


    def resolve_static(subdir, uri)
      return nil if settings.non_static_extnames.include?(File.extname(uri))
      @dirs.each do |dir|
        path = content_dir(dir, subdir, uri)
        return path if File.file?(path)
      end
      nil
    end

    def resolve_template(subdir, extnames, uri)
      @dirs.each do |dir|
        extnames.each do |extname|
          path = content_dir(dir, subdir, "#{uri}#{extname}")
          return path if File.file?(path)
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
        erb body, locals:locals
      when '.haml'
        haml body, locals:locals
      when '.fetch'
        url = erb(body, locals:locals)

        cache_file = cache_dir('fetch', request.site, request.path_info)
        unless File.file?(cache_file) && File.mtime(cache_file) > settings.launched_at
          FileUtils.mkdir_p File.dirname(cache_file)
          IO.write(cache_file, Net::HTTP.get(URI(url)))
        end
        pass unless File.file?(cache_file)

        cache_control :public, :must_revalidate, max_age:settings.static_max_age
        send_file(cache_file)
      when '.md', '.txt'
        preprocessed = erb body, locals:locals
        html = markdown preprocessed, locals:locals
        post_process_html_from_markdown html
      when '.redirect', '.moved', '.301'
        redirect erb(body, locals:locals), 301
      when '.found', '.302'
        redirect erb(body, locals:locals), 302
      else
        raise "'#{extname}' isn't supported."
      end
    end

    def social_metadata()
      if request.site == 'csedweek.org'
        metadata = {
          'og:title'          => @header['title'] || "The Hour of Code is coming",
          'og:description'    => @header['description'] || "The Hour of Code is a global movement reaching tens of millions of students in 180+ countries and over 30 languages. Ages 4 to 104.",
          'og:image'          => @header['og:image'] || 'http://csedweek.org/images/hour-of-code-2014-video-thumbnail.jpg',
          'og:image:width'    => @header['og:image:width'] || '1705',
          'og:image:height'   => @header['og:image:height'] || '949',
          'og:site_name'      => 'CSEd Week',
          # 'og:video'          => 'https://youtube.googleapis.com/v/rH7AjDMz_dc',
          # 'og:video:width'    => '720',
          # 'og:video:height'   => '404',
        }
      else
        metadata = {
          'og:title'          => @header['title'] || "The Hour of Code is coming",
          'og:description'    => @header['description'] || "The Hour of Code is a global movement reaching tens of millions of students in 180+ countries and over 30 languages. Ages 4 to 104.",
          'og:image'          => @header['og:image'] || 'http://code.org/images/hour-of-code-2014-video-thumbnail.jpg',
          'og:image:width'    => @header['og:image:width'] || '1705',
          'og:image:height'   => @header['og:image:height'] || '949',
          'og:site_name'      => 'Code.org',
          # 'og:video'          => 'https://youtube.googleapis.com/v/rH7AjDMz_dc',
          # 'og:video:width'    => '720',
          # 'og:video:height'   => '404',
        }
      end

      # Metatags common to all sites.
      metadata['fb:app_id'] = '500177453358606'
      metadata['og:type'] = 'article'
      # metadata['og:video:type'] = 'application/x-shockwave-flash'
      metadata['article:publisher'] = 'https://www.facebook.com/Code.org'
      metadata['og:url'] = request.url

      (@header['social']||{}).each_pair do |key, value|
        if value == ""
          metadata.delete(key)
        else
          metadata[key] = value
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

  use Router

end
