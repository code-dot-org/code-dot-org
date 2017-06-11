class Hamburger
  # These are the CSS classes applied to items in the hamburger,
  # and to the hamburger itself.
  SHOW_ALWAYS = "show-always".freeze
  HIDE_ALWAYS = "hide-always".freeze
  SHOW_MOBILE = "show-mobile".freeze

  def self.get_visibility(options)
    show_teacher_options = HIDE_ALWAYS
    show_student_options = HIDE_ALWAYS
    show_signed_out_options = HIDE_ALWAYS
    show_pegasus_options = HIDE_ALWAYS
    show_help_options = HIDE_ALWAYS

    hamburger_class = "none"

    if options[:level]
      # The header is taken over by level-related UI, so we need the hamburger
      # to show whatever would show up in the header at desktop (and mobile) widths.
      show_help_options = SHOW_ALWAYS

      if options[:user_type] == "teacher"
        show_teacher_options = SHOW_ALWAYS
      elsif options[:user_type] == "student"
        show_student_options = SHOW_ALWAYS
      else
        show_signed_out_options = SHOW_ALWAYS
      end

      # Regardless of user type, if they are English, then they also need the pegasus
      # options in the hamburger.
      if options[:language] == "en"
        show_pegasus_options = SHOW_ALWAYS
      end

    else

      # The header is available for showing whichever options we want, but they should
      # appear in the hamburger at mobile widths.
      if options[:user_type] == "teacher"
        show_teacher_options = SHOW_MOBILE
      elsif options[:user_type] == "student"
        show_student_options = SHOW_MOBILE
      else
        show_signed_out_options = SHOW_MOBILE
      end

      if options[:language] == "en"
        # We want to show the pegasus options.  They're in the hamburger for desktop
        # if they didn't fit on the header, or they're just in it for mobile if they did.
        if options[:user_type] == "teacher" || options[:user_type] == "student"
          show_pegasus_options = SHOW_ALWAYS
          show_help_options = SHOW_ALWAYS
        else
          show_pegasus_options = SHOW_MOBILE
          show_help_options = SHOW_MOBILE
        end
      else
        show_help_options = SHOW_ALWAYS
      end
    end

    # Do we show hamburger on all widths, only mobile, or not at all?
    show_set = [show_teacher_options, show_student_options, show_signed_out_options, show_pegasus_options, show_help_options]
    if show_set.include? SHOW_ALWAYS
      hamburger_class = SHOW_ALWAYS
    elsif show_set.include? SHOW_MOBILE
      hamburger_class = SHOW_MOBILE
    else
      hamburger_class = HIDE_ALWAYS
    end

    # Return the various visibility styles.
    {
      hamburger_class: hamburger_class,
      show_teacher_options: show_teacher_options,
      show_student_options: show_student_options,
      show_signed_out_options: show_signed_out_options,
      show_pegasus_options: show_pegasus_options,
      show_help_options: show_help_options
    }
  end

  def self.get_contents(options)
    loc_prefix = options[:loc_prefix]
    studio_url_base = options[:studio_url_base]
    code_org_url_base = options[:code_org_url_base]

    teacher_entries = [
      {title: I18n.t("#{loc_prefix}home"), url: "#{studio_url_base}/home"},
      {title: I18n.t("#{loc_prefix}courses"), url: "#{studio_url_base}/courses"},
      {title: I18n.t("#{loc_prefix}project_gallery"), url: "#{studio_url_base}/projects"},
      {title: I18n.t("#{loc_prefix}sections"), url: "#{code_org_url_base}/teacher-dashboard#/sections"},
      {title: I18n.t("#{loc_prefix}professional_learning"), url: "#{studio_url_base}/my-professional-learning"}
    ].freeze

    student_entries = [
      {title: I18n.t("#{loc_prefix}courses"), url: "#{studio_url_base}/courses"},
      {title: I18n.t("#{loc_prefix}project_gallery"), url: "#{studio_url_base}/projects"}
    ]

    signed_out_entries = [
      {title: I18n.t("#{loc_prefix}courses"), url: "#{studio_url_base}/courses"},
      {title: I18n.t("#{loc_prefix}project_gallery"), url: "#{studio_url_base}/projects/public"}
    ]

    educate_entries = [
      {title: I18n.t("#{loc_prefix}educate_overview"), url: "#{code_org_url_base}/educate"},
      {title: I18n.t("#{loc_prefix}educate_elementary"), url: "#{code_org_url_base}/educate/curriculum/elementary-school"},
      {title: I18n.t("#{loc_prefix}educate_middle"), url: "#{code_org_url_base}/educate/curriculum/middle-school"},
      {title: I18n.t("#{loc_prefix}educate_high"), url: "#{code_org_url_base}/educate/curriculum/high-school"},
      {title: I18n.t("#{loc_prefix}educate_hoc"), url: "https://hourofcode.com"},
      {title: I18n.t("#{loc_prefix}educate_partner"), url: "#{code_org_url_base}/educate/partner"},
      {title: I18n.t("#{loc_prefix}educate_beyond"), url: "#{code_org_url_base}/educate/curriculum/3rd-party"},
      {title: I18n.t("#{loc_prefix}educate_inspire"), url: "#{code_org_url_base}/educate/resources/inspire"},
      {title: I18n.t("#{loc_prefix}educate_community"), url: "#{code_org_url_base}/educate/community"},
      {title: I18n.t("#{loc_prefix}educate_tools"), url: "#{code_org_url_base}/educate/resources/videos"},
    ]

    about_entries = [
      {title: I18n.t("#{loc_prefix}about_us"), url: "#{code_org_url_base}/about"},
      {title: I18n.t("#{loc_prefix}about_leadership"), url: "#{code_org_url_base}/about/leadership"},
      {title: I18n.t("#{loc_prefix}about_donors"), url: "#{code_org_url_base}/about/donors"},
      {title: I18n.t("#{loc_prefix}about_partners"), url: "#{code_org_url_base}/about/partners"},
      {title: I18n.t("#{loc_prefix}about_team"), url: "#{code_org_url_base}/about/team"},
      {title: I18n.t("#{loc_prefix}about_news"), url: "#{code_org_url_base}/about/news"},
      {title: I18n.t("#{loc_prefix}about_evaluation"), url: "#{code_org_url_base}/about/evaluation"},
      {title: I18n.t("#{loc_prefix}about_jobs"), url: "#{code_org_url_base}/about/jobs"},
      {title: I18n.t("#{loc_prefix}about_contact"), url: "#{code_org_url_base}/contact"},
      {title: I18n.t("#{loc_prefix}about_faqs"), url: "#{code_org_url_base}/faq"},
    ]

    # Get visibility CSS.
    visibility_options = {level: options[:level], language: options[:language], user_type: options[:user_type]}
    visibility = Hamburger.get_visibility(visibility_options)

    # Generate the list of entries.

    entries = []

    # user_type-specific.

    if options[:user_type] == "teacher"
      entries = entries.concat teacher_entries.each {|e| e[:class] = visibility[:show_teacher_options]}
      entries << {type: "divider", class: visibility[:show_teacher_options]}
    elsif options[:user_type] == "student"
      entries = entries.concat student_entries.each {|e| e[:class] = visibility[:show_student_options]}
      entries << {type: "divider", class: visibility[:show_student_options]}
    else
      entries = entries.concat signed_out_entries.each {|e| e[:class] = visibility[:show_signed_out_options]}
      entries << {type: "divider", class: visibility[:show_signed_out_options]}
    end

    # Help-related.

    if options[:level] || options[:script_level]
      report_url = options[:script_level] ? options[:script_level].report_bug_url(options[:request]) : options[:level].report_bug_url(options[:request])
      entries << {title: I18n.t("#{loc_prefix}report_bug"), url: report_url, class: visibility[:show_help_options]}
    else
      entries << {title: I18n.t("#{loc_prefix}report_bug"), url: "https://support.code.org/hc/en-us/requests/new", class: visibility[:show_help_options]}
    end

    entries << {title: I18n.t("#{loc_prefix}help_support"), url: "https://support.code.org", class: visibility[:show_help_options]}

    if options[:user_type] == "teacher"
      entries << {title: I18n.t("#{loc_prefix}teacher_community"), url: "http://forum.code.org/", class: visibility[:show_help_options]}
    end

    if options[:level] && options[:level].try(:is_project_level) && options[:level.game] == Game.gamelab
      entries << {title: I18n.t("#{loc_prefix}documentation"), url: "https://docs.code.org/gamelab/", class: visibility[:show_help_options]}
    end

    if options[:level] && options[:level].try(:is_project_level) && options[:level].game == Game.applab
      entries << {title: I18n.t("#{loc_prefix}documentation"), url: "https://docs.code.org/applab/", class: visibility[:show_help_options]}
    end

    if options[:level] || options[:script_level]
      entries << {title: I18n.t("#{loc_prefix}tutorials"), url: CDO.code_org_url('/educate/applab'), class: visibility[:show_help_options]}
    end

    entries << {type: "divider", class: visibility[:show_pegasus_options]}

    # Pegasus options.

    entries << {title: I18n.t("#{loc_prefix}learn"), url: "#{code_org_url_base}/student", class: visibility[:show_pegasus_options]}

    entries << {type: "expander", title: I18n.t("#{loc_prefix}teach"), id: "educate_entries", subentries: educate_entries.each {|e| e[:class] = visibility[:show_pegasus_options]}, class: visibility[:show_pegasus_options]}

    entries << {title: I18n.t("#{loc_prefix}stats"), url: "#{code_org_url_base}/promote", class: visibility[:show_pegasus_options]}

    entries << {title: I18n.t("#{loc_prefix}help_us"), url: "#{code_org_url_base}/help", class: visibility[:show_pegasus_options]}

    entries << {type: "expander", title: I18n.t("#{loc_prefix}about"), id: "about_entries", subentries: about_entries.each {|e| e[:class] = visibility[:show_pegasus_options]}, class: visibility[:show_pegasus_options]}

    {entries: entries, visibility: visibility[:hamburger_class]}
  end
end
