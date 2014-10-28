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
    language = File.basename(string_file, File.extname(string_file))
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
  empty, possible_country_or_company, possible_language, path = uri.split('/',4)

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

  return "/#{path.to_s}"
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

