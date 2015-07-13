def hoc_dir(*dirs)
  pegasus_dir('sites.v3','hourofcode.com', *dirs)
end

def hoc_load_countries()
  JSON.parse(IO.read(hoc_dir('i18n/countries.json')))
end
HOC_COUNTRIES = hoc_load_countries()

def hoc_load_i18n()
  i18n = {}
  Dir.glob(hoc_dir('i18n/*.yml')).each do |string_file|
    i18n.merge!(YAML.load_file(string_file))
  end
  i18n
end
HOC_I18N = hoc_load_i18n()

def hoc_s(id)
  id = id.to_s
  HOC_I18N[@language][id] || HOC_I18N['en'][id]
end

def hoc_canonicalized_i18n_path(uri)
  _, possible_country_or_company, possible_language, path = uri.split('/',4)

  if HOC_COUNTRIES[possible_country_or_company]
    @country = possible_country_or_company
  elsif @config[:companies][possible_country_or_company.to_sym]
    @company = possible_country_or_company
    @country = 'us'
  end

  if @country || @company
    if HOC_I18N[possible_language]
      @user_language = possible_language
    else
      path = File.join([possible_language, path].select{|i|!i.nil_or_empty?})
    end
  else
    @country = hoc_detect_country()
    path = File.join([possible_country_or_company, possible_language, path].select{|i|!i.nil_or_empty?})
  end

  country_language = HOC_COUNTRIES[@country]['default_language']
  @language = @user_language || country_language || hoc_detect_language()

  canonical_urls = [File.join(["/#{(@company or @country)}/#{@language}",path].select{|i|!i.nil_or_empty?})]
  canonical_urls << File.join(["/#{(@company or @country)}", path].select{|i|!i.nil_or_empty?}) if @language == country_language
  unless canonical_urls.include?(uri)
    dont_cache
    redirect canonical_urls.last
  end

  path = uri if resolve_document(uri)

  return "/#{path}"
end

def hoc_detect_country()
  location = Geocoder.search(request.ip).first
  return 'us' unless location

  country_code = location.country_code.to_s.downcase
  return 'us' unless HOC_COUNTRIES[country_code]

  country_code
end

def hoc_detect_language()
  language = request.env['rack.locale']
  return language if HOC_I18N.keys.include?(language)
  language = language[0..1]
  return language if HOC_I18N.keys.include?(language)
  nil
end

def hoc_uri(uri)
  File.join(['/', (@company or @country), @user_language, uri].select{|i| !i.nil_or_empty?})
end

def codeorg_url()
  if @country == 'ar'
    return 'ar.code.org'
  elsif @country == 'br'
    return 'br.code.org'
  elsif @country == 'ro'
    return 'ro.code.org'
  elsif @country == 'uk'
    return 'uk.code.org'
  else
    return 'code.org'
  end
end

def resolve_url(url)
  if url.downcase.include? "studio.code.org" 
    # if studio.code.org url do nothing
  elsif url.downcase.include? "code.org" # if code.org url, link to partner site
    # TODO: update to use countries.json if partner, show partner site
    if @country == 'ar'
      return 'ar.code.org'
    elsif @country == 'br'
      return 'br.code.org'
    elsif @country == 'ro'
      return 'ro.code.org'
    elsif @country == 'uk'
      return 'uk.code.org'
    else
      return 'code.org'
    end
  else # if hoc.com url, keep country and language in URL
    File.join(['/', (@company or @country), @user_language, uri].select{|i| !i.nil_or_empty?})
  end
end  

def resolve_file(path)
  # TODO: search for localized files or show EN
  return path
end 

def resolve_image(path)
  # TODO: search for localized files or show EN
  return path
end 

def campaign_date()
  # TODO: update to use countries.json
  if @country == 'la'
    return "October 5-11"
  else
    return "December 7-13"
  end
end

def company_count(company)
  company_count = 0;
  DB[:forms].where(kind:'HocSignup2015').each do |i|
    data = JSON.parse(i[:data])
    if data['hoc_company_s'] == company
      company_count += 1
    end
  end
  return company_count
end
