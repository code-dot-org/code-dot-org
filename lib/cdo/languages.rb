require 'cdo/db'

class Languages
  @@table = PEGASUS_DB[:cdo_languages]

  def self.get_crowdin_languages
    @@table.select(:crowdin_code_s, :crowdin_name_s).where("crowdin_code_s != 'en'")
  end

  def self.get_crowdin_name_and_locale
    @@table.select(:crowdin_name_s, :locale_s)
  end

  def self.get_locale
    @@table.select(:locale_s)
  end

  def self.get_hoc_languages
    @@table.select(:locale_s, :unique_language_s, :crowdin_code_s, :crowdin_name_s).where("crowdin_code_s != 'en'")
  end

  def self.get_hoc_locale_by_unique_language(unique_language)
    @@table.select(:locale_s, :unique_language_s).where("unique_language_s = '#{unique_language}'").first[:locale_s]
  end

  def self.get_hoc_unique_language_by_locale(locale)
    @@table.select(:unique_language_s, :locale_s).where("locale_s = '#{locale}'").first[:unique_language_s]
  end

  def self.get_csf_languages
    @@table.select(:csf_b, :crowdin_name_s)
  end

  def self.get_minecraft_designer_languages
    @@table.select(:minecraft_designer_b, :crowdin_name_s)
  end

  def self.get_minecraft_adventurer_languages
    @@table.select(:minecraft_adventurer_b, :crowdin_name_s)
  end

  def self.get_starwars_languages
    @@table.select(:starwars_b, :crowdin_name_s)
  end

  def self.get_frozen_languages
    @@table.select(:frozen_b, :crowdin_name_s)
  end
end
