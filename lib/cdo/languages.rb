require 'cdo/db'
require 'cdo/cache_method'

class Languages
  using CacheMethod

  def self.table
    @@table ||= PEGASUS_DB[:cdo_languages]
  end

  cached def self.get_crowdin_languages
    table.select(:crowdin_code_s, :crowdin_name_s).where("crowdin_code_s != 'en'").to_a
  end

  cached def self.get_crowdin_name_and_locale
    table.select(:crowdin_name_s, :locale_s).to_a
  end

  cached def self.get_locale
    table.select(:locale_s).to_a
  end

  cached def self.get_hoc_languages
    table.select(:locale_s, :unique_language_s, :crowdin_code_s, :crowdin_name_s).where("crowdin_code_s != 'en'").to_a
  end

  cached def self.get_hoc_locale_by_unique_language(unique_language)
    table.select(:locale_s, :unique_language_s).where("unique_language_s = '#{unique_language}'").first[:locale_s]
  end

  cached def self.get_hoc_unique_language_by_locale(locale)
    table.select(:unique_language_s, :locale_s).where("locale_s = '#{locale}'").first[:unique_language_s]
  end

  cached def self.get_native_name_by_locale(locale)
    table.select(:native_name_s, :locale_s).where("locale_s = '#{locale}'").to_a
  end

  cached def self.get_code_by_locale(locale)
    table.select(:code_s, :locale_s).where("locale_s = '#{locale}'").first[:code_s]
  end

  cached def self.get_csf_languages
    table.select(:csf_b, :crowdin_name_s).to_a
  end

  cached def self.get_minecraft_designer_languages
    table.select(:minecraft_designer_b, :crowdin_name_s).to_a
  end

  cached def self.get_minecraft_adventurer_languages
    table.select(:minecraft_adventurer_b, :crowdin_name_s).to_a
  end

  cached def self.get_starwars_languages
    table.select(:starwars_b, :crowdin_name_s).to_a
  end

  cached def self.get_frozen_languages
    table.select(:frozen_b, :crowdin_name_s).to_a
  end
end
