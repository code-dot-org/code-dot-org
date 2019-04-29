require 'mustache'

def hoc_dir(*dirs)
  pegasus_dir('sites.v3', 'hourofcode.com', *dirs)
end

def hoc_load_countries
  JSON.parse(IO.read(hoc_dir('i18n/countries.json')))
end
HOC_COUNTRIES = hoc_load_countries

class MustacheMarkdown < Mustache

  def set_template(full_document)
    self.template = full_document
  end

  def campaigndateyear
    @country ||= hoc_detect_country
    return HOC_COUNTRIES[@country]['campaign_date_year']
  end

  def campaigndatefull
    @country ||= hoc_detect_country
    return HOC_COUNTRIES[@country]['campaign_date_full']
  end

  def campaigndateshort
    @country ||= hoc_detect_country
    return HOC_COUNTRIES[@country]['campaign_date_short']
  end

  def country
    @country ||= hoc_detect_country
  end

  def hoc_detect_country
    return 'us'
    location = request.location
    return 'us' unless location

    country_code = location.country_code.to_s.downcase
    country_code = 'uk' if country_code == 'gb'
    return 'us' unless HOC_COUNTRIES[country_code]

    country_code
  end

  def localized_image(path)
    #lambda { |path| File.join('/', self.country, 'en-us', path) }
    File.join("/", self.country, "en", path)
  end

  def resolve_url(url)
    if url.downcase.include? "code.org"
      url
    else
      File.join(['/', (@company || @country), @user_language, url].reject(&:nil_or_empty?))
    end
  end
end

