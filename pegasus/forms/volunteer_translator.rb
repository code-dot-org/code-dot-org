class VolunteerTranslator

  def self.normalize(data)
    result = {}

    result[:first_name_s] = required stripped data[:first_name_s]
    result[:last_name_s] = required stripped data[:last_name_s]
    result[:email_s] = required email_address data[:email_s]
    result[:translation_type_s] = required data[:translation_type_s]
    result[:contact_s] = required data[:contact_s]
    result[:language_ss] = required data[:language_ss]
    if result[:language_ss].class != FieldError && result[:language_ss].include?('Other')
      result[:language_other_ss] = required stripped csv_multivalue data[:language_other_ss]
    end

    result
  end

  def self.languages()
    [
      'Afrikaans',
      'Albanian',
      'Arabic',
      'Assamese',
      'Azerbaijani',
      'Basque',
      'Bengali',
      'Bulgarian',
      'Burmese',
      'Catalan',
      'Chinese Simplified',
      'Chinese Traditional',
      'Croatian',
      'Czech',
      'Danish',
      'Dutch',
      'Esperanto',
      'Filipino',
      'Finnish',
      'French',
      'German',
      'Greek',
      'Hebrew',
      'Hindi',
      'Hungarian',
      'Icelandic',
      'Indonesian',
      'Italian',
      'Japanese',
      'Korean',
      'Lithuanian',
      'Malay',
      'Nepali',
      'Norwegian',
      'Persian',
      'Polish',
      'Portuguese',
      'Portuguese (Brazilian)',
      'Romanian',
      'Russian',
      'Serbian (Cyrillic)',
      'Sinhala',
      'Slovak',
      'Slovenian',
      'Spanish',
      'Swedish',
      'Tamil',
      'Thai',
      'Turkish',
      'Ukrainian',
      'Urdu (Pakistan)',
      'Vietnamese',
      'Welsh',
    ]
  end

  def self.receipt()
    'volunteer_translator_notice'
  end

  def self.index(data)
    data['language_ss'] = data['language_ss'] - ['Other']
    data['language_ss'].concat(data['language_other_ss'] || []).sort.uniq;
    data
  end

end