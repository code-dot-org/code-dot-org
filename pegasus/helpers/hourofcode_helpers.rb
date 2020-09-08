def hoc_dir(*dirs)
  pegasus_dir('sites.v3', 'hourofcode.com', *dirs)
end

def hoc_load_countries
  JSON.parse(IO.read(hoc_dir('i18n/countries.json')))
end
HOC_COUNTRIES = hoc_load_countries

def hoc_load_i18n
  i18n = {}
  Dir.glob(hoc_dir('i18n/*.yml')).each do |string_file|
    i18n.merge!(YAML.load_file(string_file))
  end
  i18n
end
HOC_I18N = hoc_load_i18n

# Can be called by pages on hourofcode.com, code.org, or csedweek.org to retrieve
# a string from the hourofcode.com translations.
# When called on hourofcode.com, it uses @language.
# When called from the other sites, it uses request.locale and converts that XX-XX
# locale code into a two-letter language code which notably involves a database hit to
# do that conversion using information in the cdo-languages gsheet.
#
# Can be called with markdown: true to render the string as (HTML-safe)
# markdown, or with markdown: :inline to render as inline markdown.
def hoc_s(id, markdown: false, locals: nil)
  id = id.to_s
  language = @language || Languages.get_hoc_unique_language_by_locale(request.locale)
  string = HOC_I18N[language][id] || HOC_I18N['en'][id]

  # manually implement a very simple version of string interpolation
  if locals.present?
    locals.each do |key, value|
      string.gsub!(/%{#{key}}/, value)
    end
  end

  if markdown
    type = markdown == :inline ? :inline_md : :safe_md
    string = @actionview.render(inline: string, type: type)
  end

  string
end

def hoc_canonicalized_i18n_path(uri, query_string)
  _, possible_country_or_company, possible_language, path = uri.split('/', 4)

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
      path = File.join([possible_language, path].reject(&:nil_or_empty?))
    end
  else
    @country = hoc_detect_country
    path = File.join([possible_country_or_company, possible_language, path].reject(&:nil_or_empty?))
  end

  country_language = HOC_COUNTRIES[@country]['default_language']

  # If the user has set their browser to a non-english language, always default
  # to that language. (Because we can safely assume in this case that changing
  # that browser setting was a conscious decision that we can respect)
  #
  # Otherwise, if we have a geolocation-inferred language for the user, default
  # to that. (Because some information is better than nothing)
  #
  # Otherwise, just default to english.
  browser_non_english = !hoc_detect_language.nil? && hoc_detect_language != 'en'
  default_language = browser_non_english ? hoc_detect_language : country_language

  @language = @user_language || default_language

  canonical_urls = [File.join(["/#{(@company || @country)}/#{@language}", path].reject(&:nil_or_empty?))]
  canonical_urls << File.join(["/#{(@company || @country)}", path].reject(&:nil_or_empty?)) if @language == country_language
  unless canonical_urls.include?(uri)
    dont_cache
    redirect canonical_urls.last + (query_string.empty? ? '' : "?#{query_string}")
  end

  # We no longer want the country to be part of the path we use to search:
  search_uri = File.join('/', [@language, path].compact)
  return search_uri if resolve_document(search_uri)
  return "/#{path}"
end

def hoc_detect_country
  location = request.location
  return 'us' unless location

  country_code = location.country_code.to_s.downcase
  country_code = 'uk' if country_code == 'gb'
  return 'us' unless HOC_COUNTRIES[country_code]

  country_code
end

def hoc_detect_language
  language = request.env['rack.locale']
  return language if HOC_I18N.keys.include?(language)
  language = language[0..1]
  return language if HOC_I18N.keys.include?(language)
  nil
end

# Called by pages on hourofcode.com to convert the current two-letter language (stored
# in @language) into an XX-XX locale code as used by code.org/csedweek.org/apps.
def hoc_get_locale_code
  Languages.get_hoc_locale_by_unique_language(@language)
end

def hoc_uri(uri)
  File.join(['/', (@company || @country), @user_language, uri].reject(&:nil_or_empty?))
end

def codeorg_url(path)
  CDO.code_org_url(path, 'https:')
end

def chapter_partner?
  return CDO.partners.include?(@country)
end

def resolve_url(url)
  if url.downcase.include? "code.org"
    url
  else
    File.join(['/', (@company || @country), @user_language, url].reject(&:nil_or_empty?))
  end
end

def localized_file(path)
  localized_path = File.join('/', @language, path)
  return localized_path if resolve_static('public', localized_path)

  return path
end

def localized_image(path)
  File.join('/', @country, @language, path)
end

def campaign_date(format)
  @country ||= hoc_detect_country
  type = HOC_COUNTRIES[@country]['type'] || 'default'
  language = HOC_COUNTRIES[@country]['default_language']
  id = 'campaign_date_full'

  case format
  when "start-short"
    id = 'campaign_date_start_short'
  when "start-long"
    id = 'campaign_date_start_long'
  when "short"
    id = 'campaign_date_short'
  when "full"
    id = 'campaign_date_full'
  when "year"
    id = 'campaign_date_year'
  when "full-year"
    id = 'campaign_date_full_year'
  end

  if %w(latam europe africa).include? type
    id = "#{type}_#{id}"
  end

  return HOC_I18N[language][id] || HOC_I18N['en'][id]
end

def company_count
  return fetch_hoc_metrics['hoc_company_totals'][@company]
end

def country_count
  code = HOC_COUNTRIES[@country]['country_code'] || @country
  return fetch_hoc_metrics['hoc_country_totals'][code.upcase]
end

def country_full_name
  return HOC_COUNTRIES[@country]['full_name']
end
