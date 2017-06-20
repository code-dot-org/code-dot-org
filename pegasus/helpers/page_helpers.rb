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

# Returns a CSS Media Query string matching devices with 'retina' displays.
# Ref: https://www.w3.org/blog/CSS/2012/06/14/unprefix-webkit-device-pixel-ratio/
# Setting `is_retina` to `false` matches non-retina displays.
def css_retina?(is_retina = true)
  css_query_parts = ['-webkit-min-device-pixel-ratio: 2', 'min-resolution: 192dpi']
  css_query_parts.map{|q| "#{!is_retina ? 'not all and ' : ''}(#{q})"}.join(', ')
end
