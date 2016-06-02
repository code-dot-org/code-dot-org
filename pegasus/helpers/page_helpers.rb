def page_title_with_tagline()
  title = @header['title'] || @config[:page_default_title].to_s
  tagline = @header['tagline'] || @config[:page_default_tagline].to_s
  return title if tagline.empty? || title == tagline
  title + ' | ' + tagline
end

def page_translated?()
  request.locale != 'en-US'
end

def partner_site?()
  partner_sites = CDO.partners.map{|x| x + '.code.org'}
  return partner_sites.include?(request.site)
end
