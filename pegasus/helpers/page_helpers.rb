require 'active_support/core_ext/string/indent'
require 'honeybadger'
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

  <<-HTML
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
