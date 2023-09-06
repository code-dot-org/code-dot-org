require pegasus_dir 'helper_modules/forms'

class ClassSubmission < Form
  def self.normalize(data)
    result = {}

    # Class fields
    result[:class_description_s] = required stripped data[:class_description_s]
    result[:class_format_s] = required downcased stripped data[:class_format_s]
    result[:class_format_other_s] = required stripped data[:class_format_other_s] if /_other$/.match?(result[:class_format_s])
    result[:class_languages_ss] = required stripped data[:class_languages_ss]
    if result[:class_languages_ss].class != FieldError && result[:class_languages_ss].include?('Other')
      result[:class_languages_other_ss] = required stripped csv_multivalue data[:class_languages_other_ss]
    end

    # School fields
    result[:school_name_s] = required stripped data[:school_name_s]
    result[:school_address_s] = /^online_/.match?(result[:class_format_s]) ? nil_if_empty(stripped(data[:school_address_s])) : required(stripped(data[:school_address_s]))
    result[:school_website_s] = required stripped data[:school_website_s]
    result[:school_level_ss] = required downcased stripped data[:school_level_ss]
    result[:school_gender_s] = required enum(data[:school_gender_s].to_s.strip.downcase, ['both', 'girls', 'boys'])
    result[:school_tuition_s] = required enum(data[:school_tuition_s].to_s.strip.downcase, ['yes', 'no'])

    # Public contact fields (optional)
    result[:contact_name_s] = nil_if_empty stripped data[:contact_name_s]
    result[:contact_email_s] = nil_if_empty email_address data[:contact_email_s]
    result[:contact_phone_s] = nil_if_empty data[:contact_phone_s]

    result[:email_s] = required email_address data[:email_s]
    result[:email_preference_optin_s] = required enum(data[:email_preference_optin_s].to_s.strip.downcase, ['yes', 'no'])

    result
  end

  def self.receipt
    'class_submission_receipt'
  end

  def self.formats
    (@formats ||= {})[I18n.locale] ||= formats_with_i18n_labels(
      {
        'in_school' => %w(
          daily_programming_course
          ap_computer_science
          full_university_cs_curriculum
          robotics_club
          programming_integrated_in_other_classes
          summer_school_cs_program
          exploring_computer_science
          other
        ),
        'out_of_school' => %w(
          summer_camp
          afterschool_program
          all-day_workshop
          multi-week_workshop
          other
        ),
        'online' => %w(
          programming_class
          teacher_resource
          other
        )
      }
    )
  end

  def self.formats_with_i18n_labels(groups)
    results = {}
    groups.each_pair do |key, group|
      results[key] = {'label' => I18n.t("class_submission_#{key}"), 'children' => {}}
      group.each do |format|
        format = "#{key}_#{format}"
        results[key]['children'][format] = I18n.t("class_submission_#{format}")
      end
    end

    results
  end

  def self.languages
    [
      'Code.org Code Studio',
      'Alice',
      'Arduino',
      'C++',
      'C#',
      'CSS',
      'HTML',
      'Java',
      'JavaScript',
      'Kodu',
      'Logo',
      'Mobile apps',
      'Perl',
      'PHP',
      'Processing',
      'Python',
      'Ruby',
      'Racket',
      'Ruby on Rails',
      'Scratch',
      'Scheme',
      'StarLogo Nova',
      'WeScheme',
    ]
  end

  def self.levels
    (@levels ||= {})[I18n.locale] ||= levels_with_i18n_labels(
      'preschool',
      'elementary',
      'middle_school',
      'high_school',
      'college',
      'vocational',
    )
  end

  def self.levels_with_i18n_labels(*levels)
    results = {}
    levels.each do |level|
      results[level] = I18n.t("class_submission_level_#{level}")
    end
    results
  end

  def self.published_states
    %w(
      approved
      rejected
      undecided
    )
  end

  def self.process_with_ip(data, created_ip)
    if data['email_preference_optin_s'] && created_ip && data['email_s']
      EmailPreferenceHelper.upsert!(
        email: data['email_s'],
        opt_in: data['email_preference_opt_in_s'] == 'yes',
        ip_address: created_ip,
        source: EmailPreferenceHelper::FORM_CLASS_SUBMIT,
        form_kind: '0'
      )
    end

    {}.tap do |results|
      location = search_for_address(data['school_address_s'])
      results.merge! location.summarize if location

      # Add additional data that was previously only used for indexing.
      results.merge! additional_data(data)
    end
  end

  # Called by process_with_ip which is called by process_forms' process_batch_of_forms
  # which writes to the database's processed_data column in the forms table.
  def self.additional_data(data)
    new_data = {}

    ['in_school', 'out_of_school', 'online'].each do |prefix|
      class_format = data['class_format_s']
      if /^#{prefix}_/.match?(class_format)
        new_data['class_format_category_s'] = prefix
        new_data['class_format_subcategory_s'] = class_format.sub(/^#{prefix}_/, '')
      end
    end

    new_data['class_languages_all_ss'] = data['class_languages_ss'] - ['Other']
    new_data['class_languages_all_ss'].concat(data['class_languages_other_ss'] || []).sort.uniq

    # Create a case-insensitive version of the name for sorting.
    new_data['school_name_sort_s'] = data['school_name_s'].downcase

    new_data
  end

  def self.query(params)
    query = ::PEGASUS_DB[:forms].
            where(
              {
                kind: name,
                review: "approved"
              }
      ).
            exclude(
              Sequel.function(:coalesce, Forms.json('processed_data.class_format_category_s'), '') => "online"
      )

    unless params['class_format_category_s'].nil_or_empty?
      query = query.where(
        Forms.json('processed_data.class_format_category_s') => params['class_format_category_s']
      )
    end

    unless params['school_tuition_s'].nil_or_empty?
      query = query.where(
        Forms.json('data.school_tuition_s') => params['school_tuition_s']
      )
    end

    coordinates = params['coordinates']
    distance = 100
    rows = 500

    unless params['class_languages_all_ss'].nil_or_empty?
      language_choices = params['class_languages_all_ss'].map do |language|
        "\"#{language}\""
      end.join(',')

      language_choices = "[#{language_choices}]"

      query = query.where(
        Sequel.function(:json_contains,
          Forms.json('processed_data.class_languages_all_ss'),
          language_choices
        )
      )
    end

    unless params['school_level_ss'].nil_or_empty?
      level_choices = params['school_level_ss'].map do |level|
        "\"#{level}\""
      end.join(',')

      level_choices = "[#{level_choices}]"

      query = query.where(
        Sequel.function(:json_contains,
          Forms.json('data.school_level_ss'),
          level_choices
        )
      )
    end

    fl = 'location_p,school_name_s,school_address_s,class_format_s,school_tuition_s,school_level_ss,school_website_s,class_description_s'.split(',').map do |field|
      Forms.json("data.#{field}").as(field)
    end

    fl += 'class_format_category_s,class_format_subcategory_s,class_languages_all_ss,school_name_sort_s'.split(',').map do |field|
      Forms.json("processed_data.#{field}").as(field)
    end

    if coordinates && distance
      distance_query = Sequel.function(:ST_Distance_Sphere,
        Sequel.function(:ST_PointFromText, "POINT (#{coordinates.split(',').reverse.join(' ')})", 4326),
        Sequel.function(:ST_PointFromText,
          Sequel.function(:concat,
            'POINT (',
            Sequel.function(:substring_index, Forms.json('processed_data.location_p'), ',', -1),
            ' ',
            Sequel.function(:substring_index, Forms.json('processed_data.location_p'), ',', 1),
            ')'
          ),
          4326
        )
      ) / 1000
      query = query.where Sequel.lit(Forms.json('processed_data.location_p'))
      query = query.where {distance_query < distance}
      fl.push distance_query.as(:distance)
    end

    docs = query.select(
      *fl,
      Forms.json('processed_data.location_p').as(:location_p),
      :id
    ).limit(rows).to_a
    docs.each do |doc|
      doc[:school_level_ss] = JSON.parse(doc[:school_level_ss])
      doc[:class_languages_all_ss] = JSON.parse(doc[:class_languages_all_ss])
    end
    {
      facet_counts: {facet_fields: {}},
      response: {docs: docs}
    }.to_json
  end
end
