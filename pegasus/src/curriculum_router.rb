require File.expand_path('../env', __FILE__)
require 'cdo/rack/request'
require 'cdo/yaml'
require 'json'

def http_content_type(type,params={})
  params = params.map { |k,v| "#{k}=#{v}" }.join('; ')
  params.empty? ? type : [type, params].join('; ')
end

def http_expires_at(time)
  time.strftime('%a, %d %b %Y %H:%M:%S GMT')
end

def http_expires_in(seconds)
  http_expires_at(Time.now + seconds)
end

def http_host_and_port(host,port=80)
  return host if port == 80
  "#{host}:#{port}"
end

def social_metadata(request, header=nil)
  metadata = {}

  # Metatags common to all sites.
  metadata['og:title'] = header['title']
  metadata['fb:app_id'] = '500177453358606'
  metadata['og:type'] = 'article'
  metadata['article:publisher'] = 'https://www.facebook.com/Code.org'
  metadata['og:url'] = request.url

  (header['social']||{}).each_pair do |key, value|
    if value == ""
      metadata.delete(key)
    else
      metadata[key] = value
    end
  end

  metadata
end

#
# HttpDocument normalizes a document-in-transition through our system.
#
class HttpDocument

  attr_accessor :status, :headers, :body

  def initialize(body, headers={}, status=200)
    @body = body

    @headers = {}
    @headers['Content-Length'] = @body.bytesize.to_s unless @body.nil_or_empty?
    @headers.merge!(headers)

    @status = status
  end

  def self.from_file(path,headers={}, status=200)
    content_type = content_type_from_path(path)
    self.new(IO.read(path), {'Content-Type'=>content_type, 'X-Pegasus-File'=>path}.merge(headers))
  end

  def charset?(charset)
    @headers['Content-Type'].to_s.include?("charset=#{charset}")
  end

  def haml?()
    @headers['Content-Type'].to_s.include?('text/haml')
  end

  def html?()
    @headers['Content-Type'].to_s.include?('text/html')
  end

  def markdown?()
    @headers['Content-Type'].to_s.include?('text/markdown')
  end

  def to_html!(locals, options={})
    to_html_from_haml!(locals, options) if haml?
    to_html_from_markdown!(locals, options) if markdown?

    return unless html?

    apply_encoding!
    apply_view!(locals)
    apply_theme!(locals)
  end

  private

  def apply_encoding!()
    # Ruby can't always detect utf-8 encoded data so if the content type indicates that this is
    # utf-8, FORCE Ruby to consider it such.
    if charset?('utf-8')
      @body = @body.force_encoding('UTF-8')
      @headers['Content-Length'] = @body.bytesize.to_s
    end
  end

  def apply_theme!(locals)
    theme = headers['X-Pegasus-Theme']||'theme'
    return if theme == 'none'

    content = @body
    head = ''
    classes = nil
    if(m = content.match(/\<head\>\s(?<head>.*)\s\<\/head\>/m))
      head = m[:head]
    end
    if(m = content.match(/\<body(?<params>[^>]*)\>(?<body>.*)<\/body\>/m))
      content = m[:body]
      if(n = m[:params].match(/^\s*class\s*=\s*["'](?<value>[^'"]*)["']/m))
        classes = n[:value]
      end
    end

    path = resolve_template(locals[:request].site, theme)
    raise Exception, "'#{theme}' theme not found." if path.nil?

    @body = TextRender.haml_file(path, locals.merge({
      :header=>JSON.parse(headers['X-Pegasus-Header']||'{}'),
      :body=>content,
      :classes=>classes,
      :head=>head,
    }))
    @headers['Content-Length'] = @body.bytesize.to_s
  end

  def apply_view!(locals)
    view = headers['X-Pegasus-View']
    return if view.nil? || view == 'none'

    path = resolve_template(locals[:request].site, view)
    raise Exception, "'#{view}' view not found." if path.nil?

    @body = TextRender.haml_file(path, locals.merge({
      header: JSON.parse(headers['X-Pegasus-Header']||'{}'),
      body:   @body,
    }))
    @headers['Content-Length'] = @body.bytesize.to_s
  end

  def self.content_type_from_extname(extname)
    type = {
      '.md'   => http_content_type('text/markdown', charset: 'utf-8'),
      '.haml' => http_content_type('text/haml', charset: 'utf-8'),
      '.html' => http_content_type('text/html', charset: 'utf-8'),
    }[extname.to_s.downcase]
    type ||= 'application/octet-stream'

    type
  end

  def self.content_type_from_path(path)
    content_type_from_extname(File.extname(path))
  end

  def default_charset
    'utf-8'
  end

  def resolve_template(site,view)
    FileUtility.find_first_existing(
      String.multiply_concat([
        sites_dir("#{site}/views/#{view}"),
        sites_dir("all/views/#{view}"),
      ],[
        '.haml',
      ])
    )
  end

  def to_html_from_haml!(locals, options)
    header, haml = YAML.parse_yaml_header(@body, locals)
    header['social'] = social_metadata(locals[:request], header)

    @body = TextRender.haml(haml, locals)
    @headers['Content-Length'] = @body.bytesize.to_s
    @headers['Content-Type'] = http_content_type('text/html', charset: options[:charset]||default_charset)
    @headers['X-Pegasus-View'] = header['view']||'page'
    @headers['X-Pegasus-Theme'] = 'none' if header['view'] == 'none'
    @headers['X-Pegasus-Theme'] = 'none' if headers['X-Pegasus-View'] == 'page'
    @headers['X-Pegasus-Theme'] = header['theme'] unless header['theme'].nil?
    @headers['X-Pegasus-Header'] = header.to_json
  end

  def to_html_from_markdown!(locals, options)
    header, markdown = YAML.parse_yaml_header(@body)
    header['social'] = social_metadata(locals[:request], header)

    @body = TextRender.markdown(markdown, locals)
    @headers['Content-Length'] = @body.bytesize.to_s
    @headers['Content-Type'] = http_content_type('text/html', charset: options[:charset]||default_charset)
    @headers['X-Pegasus-View'] = header['view']||'page'
    @headers['X-Pegasus-Theme'] = 'none' if header['view'] == 'none'
    @headers['X-Pegasus-Theme'] = 'none' if headers['X-Pegasus-View'] == 'page'
    @headers['X-Pegasus-Theme'] = header['theme'] unless header['theme'].nil?
    @headers['X-Pegasus-Header'] = header.to_json
  end

end

module Pegasus

  class Base < Sinatra::Base

    configure do
      settings.set :environment, :development if rack_env?(:staging)
      settings.set :read_only, CDO.read_only

      settings.set :document_max_age, rack_env?(:staging) ? 0 : 3600
      settings.set :image_max_age, rack_env?(:staging) ? 0 : 36000

      settings.set :image_extnames, ['.png','.jpeg','.jpg','.gif']
      settings.set :template_extnames, ['.haml', '.md']

      settings.set :blacklist, {}
      settings.set :vary, {}
    end

    before do
      ensure_no_trailing_slash_in_uri
      apply_vary_header
      I18n.locale = request.locale
    end

    after do
      response.headers.keys.each { |i| response.headers.delete(i) if i =~ /^X-Pegasus-/; }

      status = response.status.to_s.to_i
      message = "#{status} returned for #{request.site}#{request.path_info}"
      if status >= 500
        $log.error message
      elsif status >= 400
        $log.warn message
      else
        $log.debug message
      end
    end

    def self.get_head_or_post(url,&block)
      get(url,&block)
      head(url,&block)
      post(url,&block)
    end

    def apply_vary_header()
      settings.vary.each_pair do |header,pages|
        headers['Vary'] = http_vary_add_type(headers['Vary'], header) if pages.include?(request.path_info)
      end
    end

    def ensure_no_trailing_slash_in_uri()
      uri = request.path_info.chomp('/')
      redirect uri unless uri.empty? || request.path_info == uri
    end

    def deliver(document)
      status(document.status)
      headers(document.headers)
      body([document.body])
    end

    def deliver_manipulated_image(path,format,mode,width,height=nil)
      content_type format.to_sym
      cache_control :public, :must_revalidate, :max_age=>settings.image_max_age

      begin
        img = load_manipulated_image(path, mode, width, height)
        img.format = format
        img.to_blob
      ensure
        img && image.destroy!
      end
    end

    def http_vary_add_type(vary,type)
      types = vary.to_s.split(',').map(&:strip)
      return vary if types.include?('*') || types.include?(type)
      types.push(type).join(',')
    end

    def render(document,locals={})
      document.to_html!(locals.merge({
        settings: settings,
        request: request,
        response: response,
        params: params,
        session: session,
      }))
      deliver(document)
    end

    def resolve_document(root,uri,headers={})
      base = File.join(root,uri)

      extnames = settings.template_extnames
      indexes = %w(index _all)

      headers = {
        'Cache-Control'   => "max-age=#{settings.document_max_age}, public, must-revalidate",
        'Expires'         => http_expires_in(settings.document_max_age),
      }.merge(headers)

      extnames.each do |extname|
        if File.file?(path = "#{base}#{extname}")
          return HttpDocument.from_file(path,headers)
        end

        indexes.each do |index|
          if File.file?(path = File.join(base,"#{index}#{extname}"))
            return HttpDocument.from_file(path,headers)
          end
        end
      end

      unless uri == '/'
        parent = File.dirname(base)

        extnames.each do |extname|
          if File.file?(path = "#{parent}/_all#{extname}")
            return HttpDocument.from_file(path,headers.merge({
              'Cache-Control'=>"max-age=#{settings.document_max_age}, private, must-revalidate"
            }))
          end
        end
      end
      nil
    end

    def resolve_image(path)
      settings.image_extnames.each do |extname|
        file_path = "#{path}#{extname}"
        return file_path if File.file?(file_path)
      end
      nil
    end

    def submit_form(kind, request, params)
      halt 403 if settings.read_only
      begin
        content_type :json
        cache_control :private, :must_revalidate, :max_age=>0
        kind.submit(request, params).to_json
      rescue FormError=>e
        halt 400, {'Content-Type'=>'text/json'}, e.errors.to_json
      end
    end

  end

end

require src_dir 'course'

class CurriculumRouter < Pegasus::Base

  get '/curriculum/mss*' do
    redirect "/curriculum/science/#{params['splat'][0]}"
  end

  get '/curriculum/msm*' do
    redirect "/curriculum/algebra/#{params['splat'][0]}"
  end

  get '/curriculum/:kind' do |kind|
    # Temporarily prevent non K-5/MSM curriculum from appearing on production.
    unless Course::PRODUCTION_COURSES.include? kind
      pass if rack_env == :production
    end

    pass unless request.site == 'code.org'

    document = resolve_document(sites_dir('virtual'), "/curriculum-#{kind}")
    pass if document.nil?
    render(document, partials_dir: File.join(sites_dir('virtual'), "/curriculum-#{kind}"))
  end

  get '/curriculum/docs/*' do |file|
    pass unless request.site == 'code.org'

    document = resolve_document(sites_dir('virtual'), File.join('curriculum-docs', file))
    pass if document.nil?
    render(document, partials_dir: File.join(sites_dir('virtual'), "/curriculum-docs/#{file}"))
  end

  get '/curriculum/docs/*' do |filename|
    # Static files in /curriculum/docs
    path = sites_dir('virtual', 'curriculum-docs', filename)
    pass if settings.template_extnames.include?(File.extname(path))
    pass unless File.file?(path)

    cache_control :public, :must_revalidate, :max_age=>settings.document_max_age
    return send_file(path)
  end

  get '/curriculum/:kind/docs/*' do |kind, file|
    unless Course::PRODUCTION_COURSES.include? kind
      pass if rack_env == :production
    end

    pass unless request.site == 'code.org'

    document = resolve_document(sites_dir('virtual'), "/curriculum-#{kind}/docs/#{file}")
    pass if document.nil?
    render(document, partials_dir: File.join(sites_dir('virtual'), "/curriculum-#{kind}/docs/#{file}"))
  end

  get '/curriculum/:kind/*' do |kind, parts|
    unless Course::PRODUCTION_COURSES.include? kind
      pass if rack_env == :production
    end

    pass unless request.site == 'code.org'

    unit_lesson, filename = parts.split('/')

    dir = sites_dir("virtual/curriculum-#{kind}")

    if filename.nil?
      lesson_dir = dir
    else
      lesson_dir = File.join(dir, unit_lesson)
    end

    document = resolve_document(lesson_dir, filename||'lesson')
    return render(document, unit_lesson: unit_lesson, partials_dir: lesson_dir) unless document.nil?

    if File.file?(static_path = File.join(dir, parts))
      pass if settings.template_extnames.include?(File.extname(static_path))
      cache_control :public, :must_revalidate, :max_age=>settings.document_max_age
      return send_file(static_path)
    end

    pass
  end

end
