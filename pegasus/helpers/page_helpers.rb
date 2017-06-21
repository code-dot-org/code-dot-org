require 'active_support/core_ext/string/indent'

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
  path = resolve_static('public', "css/#{css}")
  path ||= shared_dir('css', css)
  path = pegasus_dir('cache', 'css', css) unless File.file?(path)
  raise "CSS not found: #{css}" unless File.file?(path)
  css_string = Sass::Engine.new(File.read(path),
    syntax: :scss,
    style: rack_env?(:development) ? :none : :compressed
  ).render.chomp

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
