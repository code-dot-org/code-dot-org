require 'json'
require_relative '../env'

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
  if request.site == 'csedweek.org'
    metadata = {
      'og:title'          => header['title'] || "The Hour of Code is here",
      'og:description'    => header['description'] || "Join millions of students to learn about the Hour of Code, the largest learning event in world history.",
      'og:image'          => header['og:image'] || 'http://csedweek.org/images/hoc-video-thumbnail.jpg',
      'og:image:width'    => header['og:image:width'] || '1200',
      'og:image:height'   => header['og:image:height'] || '627',
      'og:site_name'      => 'CSEd Week',
      'og:video'          => 'https://youtube.googleapis.com/v/FC5FbmsH4fw',
      'og:video:width'    => '720',
      'og:video:height'   => '404',
    }
  else
    metadata = {
      'og:title'          => header['title'] || "What most schools don't teach",
      'og:description'    => header['description'] || "Learn about a new \"superpower\" that isn't being taught in 90% of US schools.",
      'og:image'          => header['og:image'] || 'http://code.org/images/code-video-thumbnail.jpg',
      'og:image:width'    => header['og:image:width'] || '1440',
      'og:image:height'   => header['og:image:height'] || '810',
      'og:site_name'      => 'Code.org',
      'og:video'          => 'https://youtube.googleapis.com/v/nKIu9yen5nc',
      'og:video:width'    => '720',
      'og:video:height'   => '404',
    }
  end

  # Metatags common to all sites.
  metadata['fb:app_id'] = '500177453358606'
  metadata['og:type'] = 'article'
  metadata['og:video:type'] = 'application/x-shockwave-flash'
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
    content_type = content_type_from_path(path);
    self.new(IO.read(path), {'Content-Type'=>content_type, 'X-Pegasus-File'=>path}.merge(headers))
  end

  def is_charset?(charset)
    @headers['Content-Type'].to_s.include?("charset=#{charset}")
  end

  def is_haml?()
    @headers['Content-Type'].to_s.include?('text/haml')
  end

  def is_html?()
    @headers['Content-Type'].to_s.include?('text/html')
  end

  def is_markdown?()
    @headers['Content-Type'].to_s.include?('text/markdown')
  end

  def to_html!(locals, options={})
    to_html_from_haml!(locals, options) if is_haml?
    to_html_from_markdown!(locals, options) if is_markdown?

    return unless is_html?

    apply_encoding!
    apply_view!(locals)
    apply_theme!(locals)
  end

  private

  def apply_encoding!()
    # Ruby can't always detect utf-8 encoded data so if the content type indicates that this is
    # utf-8, FORCE Ruby to consider it such.
    if is_charset?('utf-8')
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

  def parse_yaml_header(content, locals={})
    match = content.match(/^(?<yaml>---\s*\n.*?\n?)^(---\s*$\n?)/m)
    return [{}, content] unless match
    [TextRender.yaml(match[:yaml], locals), match.post_match]
  end

  def resolve_template(site,view)
    File.find_first_existing(
      String.multiply_concat([
        sites_dir("#{site}/views/#{view}"),
        sites_dir("all/views/#{view}"),
      ],[
        '.haml',
      ])
    )
  end

  def to_html_from_haml!(locals, options)
    header, haml = parse_yaml_header(@body, locals)
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
    header, markdown = parse_yaml_header(@body)
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
