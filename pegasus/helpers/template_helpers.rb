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

def preprocess_markdown(markdown_content)
  markdown_content.gsub(/```/, "```\n")
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
  locals = @locals.merge(locals).symbolize_keys
  options = {locals: locals, line: line, path: path}

  extensions = MultipleExtnameFileUtils.all_extnames(path)

  # Now, apply the processing operations implied by each extension to the
  # given file, in an "outside-in" order
  # IE, "foo.md.erb" will be processed as an ERB template, then the result
  # of that will be processed as a MD template
  #
  # TODO elijah: Note that several extensions will perform ERB templating
  # in addition to their other operations. This functionality should be
  # removed, and the relevant templates should be renamed to "*.erb.*"
  result = body
  extensions.reverse.each do |extension|
    case extension
    when '.erb', '.html'
      result = erb result, options
    when '.haml'
      result = haml result, options
    when '.fetch'
      url = erb(result, options)

      cache_file = cache_dir('fetch', request.site, request.path_info)
      unless File.file?(cache_file) && File.mtime(cache_file) > settings.launched_at
        FileUtils.mkdir_p File.dirname(cache_file)
        IO.binwrite(cache_file, Net::HTTP.get(URI(url)))
      end
      pass unless File.file?(cache_file)

      cache :static
      result = send_file(cache_file)
    when '.md'
      preprocessed = preprocess_markdown result
      result = markdown preprocessed, options
    when '.partial'
      result = render_partials(result)
    when '.redirect', '.moved', '.301'
      result = redirect erb(result, options), 301
    when '.found', '.302'
      result = redirect erb(result, options), 302
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
