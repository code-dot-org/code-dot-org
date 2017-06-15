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

def use_min_stylesheet?
  pages_verified = {'Anyone can learn' => '/', 'About Us' => '/about', 'Donors' => '/about/donors',
    'Leadership' => '/about/leadership', 'Partners' => '/about/partners', 'Educator Overview' => '/educate',
    'Community and Support' => '/educate/community', 'Computer Science Principles' => '/educate/csp',
    'CS Fundamentals for grades K-5' => '/educate/curriculum/elementary-school',
    '3rd Party Educator Resources' => '/educate/curriculum/3rd-party', 'Tools and videos' => '/educate/resources/videos',
    'How to help' => '/help', 'Teacher Resources-Star Wars' => '/hourofcode/starwars',
    'Teacher Resources-MINECRAFT' => '/hourofcode/mc', 'Learn' => '/learn', 'Promote Computer Science' => '/promote',
    'Minecraft' => '/minecraft', 'Star Wars' => '/starwars', 'Student Overview' => '/student', 'Help Translate' => '/translate'}
  pages_verified.value?(request.path_info)
end
