require 'active_support/core_ext/string/indent'
require 'cdo/pegasus/donor'

def page_title_with_tagline
  title = @header['title'] || @config[:page_default_title].to_s
  tagline = @header['tagline'] || @config[:page_default_tagline].to_s
  return title if tagline.empty? || title == tagline
  title + ' | ' + tagline
end

def page_translated?
  request.locale != 'en-US'
end

def partner_site?
  partner_sites = CDO.partners.map {|x| x + '.code.org'}
  return partner_sites.include?(request.site)
end

def inline_css(css)
  if css == 'style-min.css'
    css_string = combine_css('styles_min').first
  else
    path = resolve_static('public', "css/#{css}")
    path ||= shared_dir('css', css)
    unless File.file?(path)
      Sass::Plugin.check_for_updates
      path = pegasus_dir('cache', 'css', css)
    end
    raise "CSS not found: #{css}" unless File.file?(path)
    css_string = Sass::Engine.new(File.read(path),
      syntax: :scss,
      style: rack_env?(:development) ? :none : :compressed
    ).render.chomp
  end

  if rack_env?(:development)
    max_inline_css = 1024 * 10
    @total_css ||= 0
    @total_css += Zlib::Deflate.deflate(css_string).bytesize
    $log.warn "Too much inlined CSS in page! [#{@total_css} bytes]" if @total_css > max_inline_css
  end

  <<-HTML.html_safe
<style>
#{css_string.indent(2)}
</style>
  HTML
end

# Returns a CSS Media Query string matching devices with 'retina' displays.
# Ref: https://www.w3.org/blog/CSS/2012/06/14/unprefix-webkit-device-pixel-ratio/
# Setting `is_retina` to `false` matches non-retina displays.
def css_retina?(is_retina = true)
  css_query_parts = ['-webkit-min-device-pixel-ratio: 2', 'min-resolution: 192dpi']
  css_query_parts.map {|q| "#{!is_retina ? 'not all and ' : ''}(#{q})"}.join(', ')
end

# Returns a concatenated, minified CSS string from all CSS files in the given paths,
# along with a digest of same.
def combine_css(*paths)
  # Special case in which we want advocacy.code.org to receive styling from code.org.
  # We still serve up the combined CSS from advocacy.code.org, rather than reach across to code.org,
  # to avoid CORS errors for the web font that is included in this combined CSS.
  request_site = request.site == "advocacy.code.org" ? "code.org" : request.site

  files = paths.map {|path| Dir.glob(pegasus_dir('sites.v3', request_site, path, '*.css'))}.flatten
  css = files.sort_by(&File.method(:basename)).map do |i|
    IO.read(i)
  end.join("\n\n")
  css_min = Sass::Engine.new(css,
    syntax: :scss,
    style: :compressed
  ).render
  digest = Digest::MD5.hexdigest(css_min)
  [css_min, digest]
end

# Used by code.org/curriculum/concepts
def youtube_embed(youtube_url)
  if youtube_url[/youtu\.be\/([^\?]*)/]
    youtube_id = $1
  else
    # Regex from # http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url/4811367#4811367
    youtube_url[/^.*((v\/)|(embed\/)|(watch\?))\??v?=?([^\&\?]*).*/]
    youtube_id = $5
  end

  %Q{<iframe title="YouTube video player" width="250" height="141" src="http://www.youtube.com/embed/#{youtube_id}" frameborder="0" allowfullscreen></iframe>}.html_safe
end

# A hacky method to generate locale-aware links to our lesson plans. This is
# hacky primarily because we are forced to hardcode here a list of supported
# languages; a list which we have no guarantee will remain accurate in the long
# term.
def hacky_localized_lesson_plan_url(path)
  # This is the list of languages currently supported by the CurriculumBuilder
  # i18n sync. This list should be kept in sync with the LANGUAGES settings
  # variable in the curriculumbuilder project. (curriculumBuilder/settings.py)
  curriculumbuilder_languages = [
    'ar-sa', 'es-mx', 'es-es', 'fr-fr', 'hi-in', 'it-it', 'pl-pl', 'pt-br', 'sk-sk', 'th-th'
  ]

  # This is a list of additional languages we want to support. These are
  # languages for which there does exist content in that language on
  # curriculum.code.org, but which aren't regularly synced.
  # Be particularly cautious about adding languages to this list; not only is
  # the content for that language not updated regularly, but new content is not
  # added automatically. This means if you try to link to a recently-added
  # lesson plan, it may not be there for any of these languages.
  additional_languages = [
    'de-de', 'id-id', 'ko-kr', 'tr-tr', 'zh-cn', 'zh-tw'
  ]

  supported_languages = curriculumbuilder_languages + additional_languages
  domain = "https://curriculum.code.org"
  current_locale = I18n.locale.to_s.downcase

  supported_languages.include?(current_locale) ?
    File.join(domain, current_locale, path) :
    File.join(domain, path)
end
