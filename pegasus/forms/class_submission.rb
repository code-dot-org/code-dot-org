class ClassSubmission

  def self.normalize(data)
    result = {}

    # Class fields
    result[:class_description_s] = required stripped data[:class_description_s]
    result[:class_format_s] = required downcased stripped data[:class_format_s]
    result[:class_format_other_s] = required stripped data[:class_format_other_s] if result[:class_format_s] =~ /_other$/
    result[:class_languages_ss] = required stripped data[:class_languages_ss]
    if result[:class_languages_ss].class != FieldError && result[:class_languages_ss].include?('Other')
      result[:class_languages_other_ss] = required stripped csv_multivalue data[:class_languages_other_ss]
    end

    # School fields
    result[:school_name_s] = required stripped data[:school_name_s]
    result[:school_address_s] = result[:class_format_s] =~ /^online_/ ? nil_if_empty(stripped data[:school_address_s]) : required(stripped data[:school_address_s])
    result[:school_website_s] = required stripped data[:school_website_s]
    result[:school_level_ss] = required downcased stripped data[:school_level_ss]
    result[:school_gender_s] = required enum(data[:school_gender_s].to_s.strip.downcase, ['both', 'girls', 'boys'])
    result[:school_tuition_s] = required enum(data[:school_tuition_s].to_s.strip.downcase, ['yes', 'no'])

    # Public contact fields (optional)
    result[:contact_name_s] = nil_if_empty stripped data[:contact_name_s]
    result[:contact_email_s] = nil_if_empty email_address data[:contact_email_s]
    result[:contact_phone_s] = nil_if_empty data[:contact_phone_s]

    result[:email_s] = required email_address data[:email_s]

    result
  end

  def self.receipt()
    'class_submission_receipt'
  end

  def self.formats()
    @formats ||= formats_with_i18n_labels({
      'in_school'=>[
        'daily_programming_course',
        'ap_computer_science',
        'full_university_cs_curriculum',
        'robotics_club',
        'programming_integrated_in_other_classes',
        'summer_school_cs_program',
        'exploring_computer_science',
        'other',
      ],
      'out_of_school'=>[
        'summer_camp',
        'afterschool_program',
        'all-day_workshop',
        'multi-week_workshop',
        'other',
      ],
      'online'=>[
        'programming_class',
        'teacher_resource',
        'other',
      ]
    })
  end

  def self.formats_with_i18n_labels(groups)
    results = {}
    groups.each_pair do |key,group|
      results[key] = {'label'=>I18n.t("class_submission_#{key}"), 'children'=>{}}
      group.each do |format|
        format = "#{key}_#{format}"
        results[key]['children'][format] = I18n.t("class_submission_#{format}")
      end
    end

    results
  end

  def self.languages()
    [
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
    ]
  end

  def self.levels()
    @levels ||= levels_with_i18n_labels(
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
      results[level] = I18n.t("class_submission_level_#{level.to_s}")
    end
    results
  end

  def self.published_states()
    [
      'approved',
      'rejected',
      'undecided',
    ]
  end

  def self.process(data, last_processed_data)
    {
      'location_p' => data['location_p'] || geocode_address(data['school_address_s'])
    }
  end

  def self.index(data)
    ['in_school', 'out_of_school', 'online'].each do |prefix|
      class_format = data['class_format_s']
      if class_format =~ /^#{prefix}_/
        data['class_format_category_s'] = prefix
        data['class_format_subcategory_s'] = class_format.sub(/^#{prefix}_/, '')
      end
    end

    data['class_languages_all_ss'] = data['class_languages_ss'] - ['Other']
    data['class_languages_all_ss'].concat(data['class_languages_other_ss'] || []).sort.uniq;

    data
  end

  # OPTIONAL: Enable searching the SOLR index
  def self.solr_query(params)
    query = "kind_s:\"#{self.name}\" && (published_s:\"approved\" || review_s:\"approved\")"

    coordinates = params['coordinates']
    distance = 100
    rows = 500

    fq = ["{!geofilt pt=#{coordinates} sfield=location_p d=#{distance}}"]

    fq.push("-class_format_category_s:online")

    fq.push("class_format_category_s:#{params['class_format_category_s']}") unless params['class_format_category_s'].nil_or_empty?
    fq.push("school_tuition_s:#{params['school_tuition_s']}") unless params['school_tuition_s'].nil_or_empty?

    params['class_languages_all_ss'].each { |language|
      fq.push("class_languages_all_ss:#{language}")
    } unless params['class_languages_all_ss'].nil_or_empty?

    params['school_level_ss'].each { |level|
      fq.push("school_level_ss:#{level}")
    } unless params['school_level_ss'].nil_or_empty?

    {
      q:query,
      fq:fq,
      facet:true,
      'facet.field'=>['class_format_category_s', 'class_languages_all_ss', 'school_level_ss', 'school_tuition_s'],
      rows:rows,
    }
  end

end
