# This class provides the content for both the hamburger and the header.
#
# As part of this content, it also provides CSS classes which determine
# responsive visibility for the header itself and the items inside it.

require_relative 'help_header'

class Hamburger
  # These are the CSS classes applied to items in the hamburger,
  # and to the hamburger itself.
  SHOW_ALWAYS = "show-always".freeze
  HIDE_ALWAYS = "hide-always".freeze
  SHOW_MOBILE = "show-mobile".freeze
  SHOW_SMALL_DESKTOP = "show-small-desktop".freeze

  def self.get_divider_visibility(above_section_visibility, below_section_visibility)
    return HIDE_ALWAYS if above_section_visibility == HIDE_ALWAYS || below_section_visibility == HIDE_ALWAYS
    return SHOW_MOBILE if above_section_visibility == SHOW_MOBILE || below_section_visibility == SHOW_MOBILE
    return SHOW_ALWAYS
  end

  def self.get_visibility(options)
    show_teacher_options = HIDE_ALWAYS
    show_student_options = HIDE_ALWAYS
    show_pegasus_options = HIDE_ALWAYS
    show_intl_about = SHOW_MOBILE
    show_help_options = SHOW_SMALL_DESKTOP

    if options[:level]
      # The header is taken over by level-related UI, so we need the hamburger
      # to show whatever would show up in the header at desktop (and mobile) widths.

      case options[:user_type]
      when 'teacher'
        show_teacher_options = SHOW_ALWAYS
        show_help_options = SHOW_MOBILE
      when 'student'
        show_student_options = SHOW_ALWAYS
        show_help_options = SHOW_MOBILE
      end

      # Regardless of user type, then they also need the pegasus
      # options in the hamburger.
      show_pegasus_options = SHOW_ALWAYS

    else

      # The header is available for showing whichever options we want, but they should
      # appear in the hamburger at mobile widths.
      case options[:user_type]
      when 'teacher'
        show_teacher_options = SHOW_MOBILE
        show_help_options = SHOW_MOBILE
      when 'student'
        show_student_options = SHOW_MOBILE
        show_help_options = SHOW_MOBILE
      end

      # We want to show the pegasus options.  They're in the hamburger for desktop
      # if they didn't fit on the header, or they're just in it for mobile if they did.
      show_pegasus_options =
        (options[:user_type] == "teacher" || options[:user_type] == "student" || options[:level]) ? SHOW_ALWAYS : SHOW_SMALL_DESKTOP
    end

    # Do we show hamburger on all widths, only mobile, or not at all?
    show_set = [show_teacher_options, show_student_options, show_pegasus_options]
    hamburger_class =
      if show_set.include? SHOW_ALWAYS
        SHOW_ALWAYS
      elsif show_set.include? SHOW_MOBILE
        SHOW_MOBILE
      elsif show_set.include? SHOW_SMALL_DESKTOP
        SHOW_SMALL_DESKTOP
      else
        HIDE_ALWAYS
      end

    # Return the various visibility styles.
    {
      hamburger_class: hamburger_class,
      show_teacher_options: show_teacher_options,
      show_student_options: show_student_options,
      show_pegasus_options: show_pegasus_options,
      show_intl_about: show_intl_about,
      show_help_options: show_help_options
    }
  end

  def self.get_hamburger_contents(options)
    loc_prefix = options[:loc_prefix]
    is_teacher_or_student = options[:user_type] == "teacher" || options[:user_type] == "student"
    is_level = options[:level]
    hide_small_desktop = is_teacher_or_student || is_level

    # Teacher-specific hamburger dropdown links.
    teacher_entries = [
      {title: "my_dashboard", url: CDO.studio_url("/home")},
      {title: "course_catalog", url: CDO.studio_url("/catalog")},
      {title: "project_gallery", url: CDO.studio_url("/projects")},
      {title: "professional_learning", url: CDO.studio_url("/my-professional-learning")},
      {title: "incubator", url: CDO.studio_url("/incubator")}
    ].each do |entry|
      entry[:title] = I18n.t("#{loc_prefix}#{entry[:title]}")
    end

    # Student-specific hamburger dropdown links.
    student_entries = [
      {title: "my_dashboard", url: CDO.studio_url("/home"), id: "hamburger-student-home"},
      {title: "course_catalog", url: CDO.code_org_url("/students")},
      {title: "project_gallery", url: CDO.studio_url("/projects"), id: "hamburger-student-projects"},
      {title: "incubator", url: CDO.studio_url("/incubator")}
    ].each do |entry|
      entry[:title] = I18n.t("#{loc_prefix}#{entry[:title]}")
    end

    # Teach hamburger dropdown links.
    educate_entries = [
      {title: "educate_overview", url: CDO.code_org_url("/teach"), id: "educate-overview"},
      {title: "course_catalog", url: CDO.studio_url("/catalog"), id: "course-catalog"},
      {title: "educate_elementary", url: CDO.code_org_url("/educate/curriculum/elementary-school")},
      {title: "educate_middle", url: CDO.code_org_url("/educate/curriculum/middle-school")},
      {title: "educate_high", url: CDO.code_org_url("/educate/curriculum/high-school")},
      {title: "educate_hoc", url: "https://hourofcode.com"},
      {title: "educate_beyond", url: CDO.code_org_url("/educate/curriculum/3rd-party")},
      {title: "educate_community", url: "https://forum.code.org/"},
      {title: "educate_requirements", url: CDO.code_org_url("/educate/it")},
      {title: "educate_tools", url: CDO.code_org_url("/educate/resources/videos")},
    ]

    # Remove Course Catalog link for teachers and students.
    # This link is already in the teacher and student entries above.
    if is_teacher_or_student
      educate_entries.delete_if {|e| e[:title] == "course_catalog"}
    end

    # Return the rest of the educate links.
    educate_entries.each do |entry|
      entry[:title] = I18n.t("#{loc_prefix}#{entry[:title]}")
    end

    educate_entries.freeze

    # About hamburger dropdown links.
    about_entries = [
      {title: "about_us", url: CDO.code_org_url("/about"), id: "about-us"},
      {title: "about_leadership", url: CDO.code_org_url("/about/leadership")},
      {title: "about_donors", url: CDO.code_org_url("/about/donors")},
      {title: "about_partners", url: CDO.code_org_url("/about/partners")},
      {title: "about_team", url: CDO.code_org_url("/about/team")},
      {title: "about_news", url: CDO.code_org_url("/about/news")},
      {title: "about_jobs", url: CDO.code_org_url("/about/jobs")},
      {title: "about_contact", url: CDO.code_org_url("/contact")},
      {title: "about_faqs", url: CDO.code_org_url("/faq")},
    ].each do |entry|
      entry[:title] = I18n.t("#{loc_prefix}#{entry[:title]}")
    end.freeze

    # Privacy & Legal hamburger dropdown links.
    legal_entries = [
      {title: "legal_privacy", url: CDO.code_org_url("/privacy")},
      {title: "legal_cookie_notice", url: CDO.code_org_url("/cookies")},
      {title: "legal_tos", url: CDO.code_org_url("/tos")},
    ].each do |entry|
      entry[:title] = I18n.t("#{loc_prefix}#{entry[:title]}")
    end.freeze

    # Get visibility CSS.
    visibility_options = {level: options[:level], language: options[:language], user_type: options[:user_type]}
    visibility = Hamburger.get_visibility(visibility_options)

    # Generate the list of entries.
    entries = []

    # user_type-specific.
    case options[:user_type]
    when 'teacher'
      entries = entries.concat(teacher_entries.each {|e| e[:class] = visibility[:show_teacher_options]})
      entries << {type: "divider", class: get_divider_visibility(visibility[:show_teacher_options], visibility[:show_help_options]), id: "after-teacher"}
    when 'student'
      entries = entries.concat(student_entries.each {|e| e[:class] = visibility[:show_student_options]})
      entries << {type: "divider", class: get_divider_visibility(visibility[:show_student_options], visibility[:show_help_options]), id: "after-student"}
    end

    # Show help links before Pegasus links for signed in users.
    help_contents = HelpHeader.get_help_contents(options)
    if is_teacher_or_student
      entries.concat(help_contents.each {|e| e[:class] = visibility[:show_help_options]})
      entries << {type: "divider", class: get_divider_visibility(visibility[:show_help_options], visibility[:show_pegasus_options]), id: "after-help"}
    end

    # Pegasus links.
    entries << {
      title: I18n.t("#{loc_prefix}learn"),
      url: CDO.code_org_url("/students"),
      class: visibility[:show_pegasus_options] + (hide_small_desktop ? "" : " hide-small-desktop"),
      id: "learn"
    }

    entries << {
      type: "expander",
      title: I18n.t("#{loc_prefix}teach"),
      id: "educate_entries",
      subentries: educate_entries.each {|e| e[:class] = visibility[:show_pegasus_options]},
      class: visibility[:show_pegasus_options] + (hide_small_desktop ? "" : " hide-small-desktop")
    }

    entries << {
      title: I18n.t("#{loc_prefix}districts"),
      url: CDO.code_org_url("/administrators"),
      class: visibility[:show_pegasus_options] + (hide_small_desktop ? "" : " hide-small-desktop"),
      id: "districts"
    }

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

    unless is_teacher_or_student
      entries << {
        title: I18n.t("#{loc_prefix}incubator"),
        url: CDO.studio_url("/incubator"),
        class: visibility[:show_pegasus_options],
        id: "incubator"
      }
    end

    entries << {
      type: "expander",
      title: I18n.t("#{loc_prefix}about"),
      id: "about_entries",
      subentries: about_entries.each {|e| e[:class] = visibility[:show_pegasus_options]},
      class: visibility[:show_pegasus_options]
    }

    entries << {
      type: "expander",
      title: I18n.t("#{loc_prefix}legal"),
      id: "legal_entries",
      subentries: legal_entries.each {|e| e[:class] = visibility[:show_pegasus_options]},
      class: visibility[:show_pegasus_options]
    }

    # Show help links at the bottom of the list for signed out users.
    unless is_teacher_or_student
      entries << {type: "divider", class: get_divider_visibility(visibility[:show_help_options], visibility[:show_pegasus_options]) + (is_level ? "  hide-large-desktop" : ""), id: "before-help"}
      entries.concat(help_contents.each {|e| e[:class] = visibility[:show_help_options]})
    end

    {entries: entries, visibility: visibility[:hamburger_class]}
  end

  # Main header navigation links next to the Code.org logo.
  def self.get_header_contents(options)
    loc_prefix = options[:loc_prefix]

    any_teacher_links = [
      {title: I18n.t("#{loc_prefix}my_dashboard"), url: CDO.studio_url("/home"), id: "header-teacher-home"},
      {title: I18n.t("#{loc_prefix}course_catalog"), url: CDO.studio_url("/catalog"), id: "header-teacher-courses"},
      {title: I18n.t("#{loc_prefix}project_gallery"), url: CDO.studio_url("/projects"), id: "header-teacher-projects"},
      {title: I18n.t("#{loc_prefix}professional_learning"), url: CDO.studio_url("/my-professional-learning"), id: "header-teacher-professional-learning"},
      {title: I18n.t("#{loc_prefix}incubator"), url: CDO.studio_url("/incubator"), id: "header-teacher-incubator"},
    ]

    any_student_links = [
      {title: I18n.t("#{loc_prefix}my_dashboard"), url: CDO.studio_url("/home"), id: "header-student-home"},
      {title: I18n.t("#{loc_prefix}course_catalog"), url: CDO.code_org_url("/students"), id: "header-student-courses"},
      {title: I18n.t("#{loc_prefix}project_gallery"), url: CDO.studio_url("/projects"), id: "header-student-projects"},
      {title: I18n.t("#{loc_prefix}incubator"), url: CDO.studio_url("/incubator"), id: "header-incubator"},
    ]

    signed_out_links = [
      {title: I18n.t("#{loc_prefix}learn"), url: CDO.code_org_url("/students"), id: "header-learn"},
      {title: I18n.t("#{loc_prefix}teach"), url: CDO.code_org_url("/teach"), id: "header-teach"},
      {title: I18n.t("#{loc_prefix}districts"), url: CDO.code_org_url("/administrators"), id: "header-districts"},
      {title: I18n.t("#{loc_prefix}stats"), url: CDO.code_org_url("/promote"), id: "header-stats", class: "hide-small-desktop"},
      {title: I18n.t("#{loc_prefix}help_us"), url: CDO.code_org_url("/help"), id: "header-help", class: "hide-small-desktop"},
      {title: I18n.t("#{loc_prefix}incubator"), url: CDO.studio_url("/incubator"), id: "header-incubator", class: "hide-small-desktop"},
      {title: I18n.t("#{loc_prefix}about"), url: CDO.code_org_url("/about"), id: "header-about", class: "hide-small-desktop"}
    ]

    if options[:user_type] == "teacher"
      any_teacher_links
    elsif options[:user_type] == "student"
      any_student_links
    else
      signed_out_links
    end
  end

  def self.get_farsi_header_contents(options)
    loc_prefix = options[:loc_prefix]

    signed_out_links = [
      {title: I18n.t("#{loc_prefix}teach"), url: CDO.code_org_url("/global/fa/teacher"), id: "header-teach"},
      {title: I18n.t("#{loc_prefix}about"), url: CDO.code_org_url("/global/fa/about"), id: "header-about"},
      {title: "CSF", url: CDO.code_org_url("/global/fa/csf"), id: "header-csf"},
      {title: "Hour of Code", url: CDO.code_org_url("/global/fa/hourofcode"), id: "header-hoc"},
      {title: "Videos", url: CDO.code_org_url("/global/fa/videos"), id: "header-videos"}
    ]

    signed_out_links
  end
end
