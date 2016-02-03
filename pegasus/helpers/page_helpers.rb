def page_title_with_tagline()
  title = @header['title'] || @config[:page_default_title].to_s
  tagline = @header['tagline'] || @config[:page_default_tagline].to_s
  return title if tagline.empty? || title == tagline
  title + ' | ' + tagline
end

def page_translated?()
  request.locale != 'en-US'
end

def locale_ro?()
  request.locale == 'ro-RO'
end

def locale_br?()
  request.locale == 'pt-BR'
end

def locale_it?()
  request.locale == 'it-IT'
end

def locale_chapter_partner?()
  request.locale() == 'ro-RO' || request.locale() == 'pt-BR' || request.locale() == 'it-IT'
end

def partner_site?()
  partner_sites = CDO.partners.map{|x|x + '.code.org'}
  return partner_sites.include?(request.site)
end

def logged_in?
  dashboard_user.present?
end

def age
  if logged_in?
    age = ((Date.today - dashboard_user[:birthday]) / 365).to_i
    age = "21+" if age >= 21
  else
    age = "21+"
  end
  age
end

def under_13?
  age.nil? || age.to_i < 13
end
