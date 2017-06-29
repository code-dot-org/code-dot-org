# This class provides the content for both the hamburger and the header.
#
# As part of this content, it also provides CSS classes which determine
# responsive visibility for the header itself and the items inside it.

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

  def self.get_hamburger_contents(options)
    loc_prefix = options[:loc_prefix]

    teacher_entries = [
      {title: "home", url: CDO.studio_url("/home")},
      {title: "courses", url: CDO.studio_url("/courses")},
      {title: "project_gallery", url: CDO.studio_url("/projects")},
      {title: "sections", url: CDO.code_org_url("/teacher-dashboard#/sections"), id: "hamburger-teacher-sections"},
      {title: "professional_learning", url: CDO.studio_url("/my-professional-learning")}
    ].each do |entry|
      entry[:title] = I18n.t("#{loc_prefix}#{entry[:title]}")
    end.freeze

    student_entries = [
      {title: "courses", url: CDO.studio_url("/courses")},
      {title: "project_gallery", url: CDO.studio_url("/projects"), id: "hamburger-student-projects"}
    ].each do |entry|
      entry[:title] = I18n.t("#{loc_prefix}#{entry[:title]}")
    end.freeze

    signed_out_entries = [
      {title: "courses", url: CDO.studio_url("/courses")},
      {title: "project_gallery", url: CDO.studio_url("/projects/public"), id: "hamburger-signed-out-projects"}
    ].each do |entry|
      entry[:title] = I18n.t("#{loc_prefix}#{entry[:title]}")
    end.freeze

    educate_entries = [
      {title: "educate_overview", url: CDO.code_org_url("/educate"), id: "educate-overview"},
      {title: "educate_elementary", url: CDO.code_org_url("/educate/curriculum/elementary-school")},
      {title: "educate_middle", url: CDO.code_org_url("/educate/curriculum/middle-school")},
      {title: "educate_high", url: CDO.code_org_url("/educate/curriculum/high-school")},
      {title: "educate_hoc", url: "https://hourofcode.com"},
      {title: "educate_partner", url: CDO.code_org_url("/educate/partner")},
      {title: "educate_beyond", url: CDO.code_org_url("/educate/curriculum/3rd-party")},
      {title: "educate_inspire", url: CDO.code_org_url("/educate/resources/inspire")},
      {title: "educate_community", url: CDO.code_org_url("/educate/community")},
      {title: "educate_tools", url: CDO.code_org_url("/educate/resources/videos")},
    ].each do |entry|
      entry[:title] = I18n.t("#{loc_prefix}#{entry[:title]}")
    end.freeze

    about_entries = [
      {title: "about_us", url: CDO.code_org_url("/about"), id: "about-us"},
      {title: "about_leadership", url: CDO.code_org_url("/about/leadership")},
      {title: "about_donors", url: CDO.code_org_url("/about/donors")},
      {title: "about_partners", url: CDO.code_org_url("/about/partners")},
      {title: "about_team", url: CDO.code_org_url("/about/team")},
      {title: "about_news", url: CDO.code_org_url("/about/news")},
      {title: "about_evaluation", url: CDO.code_org_url("/about/evaluation")},
      {title: "about_jobs", url: CDO.code_org_url("/about/jobs")},
      {title: "about_contact", url: CDO.code_org_url("/contact")},
      {title: "about_faqs", url: CDO.code_org_url("/faq")},
    ].each do |entry|
      entry[:title] = I18n.t("#{loc_prefix}#{entry[:title]}")
    end.freeze

    # Get visibility CSS.
    visibility_options = {level: options[:level], language: options[:language], user_type: options[:user_type]}
    visibility = Hamburger.get_visibility(visibility_options)

    # Generate the list of entries.

    entries = []

    # user_type-specific.

    if options[:user_type] == "teacher"
      entries = entries.concat teacher_entries.each {|e| e[:class] = visibility[:show_teacher_options]}
      entries << {type: "divider", class: visibility[:show_teacher_options], id: "after-teacher"}
    elsif options[:user_type] == "student"
      entries = entries.concat student_entries.each {|e| e[:class] = visibility[:show_student_options]}
      entries << {type: "divider", class: visibility[:show_student_options], id: "after-student"}
    else
      entries = entries.concat signed_out_entries.each {|e| e[:class] = visibility[:show_signed_out_options]}
      entries << {type: "divider", class: visibility[:show_signed_out_options], id: "after-signed-out"}
    end

    # Help-related.

    if options[:level] || options[:script_level]
      report_url = options[:script_level] ?
        options[:script_level].report_bug_url(options[:request]) :
        options[:level].report_bug_url(options[:request])
      entries << {
        title: I18n.t("#{loc_prefix}report_bug"),
        url: report_url,
        class: visibility[:show_help_options],
        id: "report-bug",
        target: "_blank"
      }
    else
      entries << {
        title: I18n.t("#{loc_prefix}report_bug"),
        url: "https://support.code.org/hc/en-us/requests/new",
        class: visibility[:show_help_options],
        id: "report-bug",
        target: "_blank"
      }
    end

    entries << {
      title: I18n.t("#{loc_prefix}help_support"),
      url: "https://support.code.org",
      class: visibility[:show_help_options],
      id: "support",
      target: "_blank"
    }

    if options[:user_type] == "teacher"
      entries << {
        title: I18n.t("#{loc_prefix}teacher_community"),
        url: "http://forum.code.org/",
        class: visibility[:show_help_options],
        target: "_blank",
        id: "teacher-community"
      }
    end

    if options[:level] && options[:level].try(:is_project_level) && options[:level].game == Game.gamelab
      entries << {
        title: I18n.t("#{loc_prefix}documentation"),
        url: "https://docs.code.org/gamelab/",
        class: visibility[:show_help_options],
        id: "gamelab-docs"
      }
    end

    if options[:level] && options[:level].try(:is_project_level) && options[:level].game == Game.applab
      entries << {
        title: I18n.t("#{loc_prefix}documentation"),
        url: "https://docs.code.org/applab/",
        class: visibility[:show_help_options],
        id: "applab-docs"
      }

      entries << {
        title: I18n.t("#{loc_prefix}tutorials"),
        url: CDO.code_org_url('/educate/applab'),
        class: visibility[:show_help_options],
        id: "applab-tutorials"
      }
    end

    entries << {type: "divider", class: visibility[:show_pegasus_options], id: "before-pegasus"}

    # Pegasus options.

    entries << {
      title: I18n.t("#{loc_prefix}learn"),
      url: CDO.code_org_url("/student"),
      class: visibility[:show_pegasus_options],
      id: "learn"
    }

    if options[:language] == "en"
      entries << {
        type: "expander",
        title: I18n.t("#{loc_prefix}teach"),
        id: "educate_entries",
        subentries: educate_entries.each {|e| e[:class] = visibility[:show_pegasus_options]},
        class: visibility[:show_pegasus_options]
      }
    end

    entries << {
      title: I18n.t("#{loc_prefix}stats"),
      url: CDO.code_org_url("/promote"),
      class: visibility[:show_pegasus_options],
      id: "stats"
    }

    entries << {
      title: I18n.t("#{loc_prefix}help_us"),
      url: CDO.code_org_url("/help"),
      class: visibility[:show_pegasus_options],
      id: "help-us"
    }

    if options[:language] == "en"
      entries << {
        type: "expander",
        title: I18n.t("#{loc_prefix}about"),
        id: "about_entries",
        subentries: about_entries.each {|e| e[:class] = visibility[:show_pegasus_options]},
        class: visibility[:show_pegasus_options]
      }
    end

    {entries: entries, visibility: visibility[:hamburger_class]}
  end

  def self.get_header_contents(options)
    loc_prefix = options[:loc_prefix]

    if options[:user_type] == "teacher"
      [
        {title: I18n.t("#{loc_prefix}home"), url: CDO.studio_url("/home"), id: "header-teacher-home"},
        {title: I18n.t("#{loc_prefix}courses"), url: CDO.studio_url("/courses"), id: "header-teacher-courses"},
        {title: I18n.t("#{loc_prefix}project_gallery"), url: CDO.studio_url("/projects"), id: "header-teacher-projects"},
        {title: I18n.t("#{loc_prefix}sections"), url: CDO.code_org_url("/teacher-dashboard#/sections"), id: "header-teacher-sections"},
        {title: I18n.t("#{loc_prefix}professional_learning"), url: CDO.studio_url("/my-professional-learning"), id: "header-teacher-professional-learning"}
      ]
    elsif options[:user_type] == "student"
      [
        {title: I18n.t("#{loc_prefix}courses"), url: CDO.studio_url("/courses"), id: "header-student-courses"},
        {title: I18n.t("#{loc_prefix}project_gallery"), url: CDO.studio_url("/projects"), id: "header-student-projects"}
      ]
    elsif options[:language] == "en"
      [
        {title: I18n.t("#{loc_prefix}learn"), url: CDO.code_org_url("/student"), id: "header-en-learn"},
        {title: I18n.t("#{loc_prefix}teach"), url: CDO.code_org_url("/educate"), id: "header-en-teach"},
        {title: I18n.t("#{loc_prefix}stats"), url: CDO.code_org_url("/promote"), id: "header-en-stats"},
        {title: I18n.t("#{loc_prefix}help_us"), url: CDO.code_org_url("/help"), id: "header-en-help"},
        {title: I18n.t("#{loc_prefix}about"), url: CDO.code_org_url("/about"), id: "header-en-about"},
        {title: I18n.t("#{loc_prefix}project_gallery"), url: CDO.studio_url("/projects/public"), id: "header-en-projects"}
      ]
    else
      [
        {title: I18n.t("#{loc_prefix}courses"), url: CDO.studio_url("/courses"), id: "header-non-en-courses"},
        {title: I18n.t("#{loc_prefix}project_gallery"), url: CDO.code_org_url("/projects/public"), id: "header-non-en-projects"}
      ]
    end
  end
end
