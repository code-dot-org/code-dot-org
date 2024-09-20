# This class provides the content for both the hamburger and the header.
#
# As part of this content, it also provides CSS classes which determine
# responsive visibility for the header itself and the items inside it.

require 'cdo/global'

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

    ge_region = options[:ge_region]
    ge_config = Cdo::Global.configuration_for(ge_region)[:header] || {}

    # Teacher-specific hamburger dropdown links.
    teacher_entries = [
      {title: "my_dashboard", url: CDO.studio_url("/home")},
    ]

    if ge_config[:'course-catalog'] != false
      teacher_entries << {title: "course_catalog", url: CDO.studio_url("/catalog")}
    end

    if ge_config[:'project-gallery'] != false
      teacher_entries << {title: "project_gallery", url: CDO.studio_url("/projects")}
    end

    if ge_config[:'professional-learning'] != false
      teacher_entries << {title: "professional_learning", url: CDO.studio_url("/my-professional-learning")}
    end

    if ge_config[:incubator] != false
      teacher_entries << {title: "incubator", url: CDO.studio_url("/incubator")}
    end

    teacher_entries.each do |entry|
      entry[:title] = I18n.t("#{loc_prefix}#{entry[:title]}")
    end

    # Student-specific hamburger dropdown links.
    student_entries = [
      {title: "my_dashboard", url: CDO.studio_url("/home"), id: "hamburger-student-home"},
    ]

    if ge_config[:'course-catalog'] != false
      student_entries << {title: "course_catalog", url: CDO.code_org_url("/students")}
    end

    if ge_config[:'project-gallery'] != false
      student_entries << {title: "project_gallery", url: CDO.studio_url("/projects"), id: "hamburger-student-projects"}
    end

    if ge_config[:incubator] != false
      student_entries << {title: "incubator", url: CDO.studio_url("/incubator")}
    end

    student_entries.each do |entry|
      entry[:title] = I18n.t("#{loc_prefix}#{entry[:title]}")
    end

    # Teach hamburger dropdown links.
    educate_entries = []

    ge_teach_config = ge_config[:'teach-menu'] || {}

    if ge_teach_config[:overview] != false
      educate_entries << {title: "educate_overview", url: CDO.code_org_url("/teach"), id: "educate-overview"}
    end

    if ge_teach_config[:'course-catalog'] != false
      educate_entries << {title: "course_catalog", url: CDO.studio_url("/catalog"), id: "course-catalog"}
    end

    if ge_teach_config[:elementary] != false
      educate_entries << {title: "educate_elementary", url: CDO.code_org_url("/educate/curriculum/elementary-school")}
    end

    if ge_teach_config[:middle] != false
      educate_entries << {title: "educate_middle", url: CDO.code_org_url("/educate/curriculum/middle-school")}
    end

    if ge_teach_config[:high] != false
      educate_entries << {title: "educate_high", url: CDO.code_org_url("/educate/curriculum/high-school")}
    end

    if ge_teach_config[:hoc] != false
      educate_entries << {title: "educate_hoc", url: "https://hourofcode.com"}
    end

    if ge_teach_config[:beyond] != false
      educate_entries << {title: "educate_beyond", url: CDO.code_org_url("/educate/curriculum/3rd-party")}
    end

    if ge_teach_config[:community] != false
      educate_entries << {title: "educate_community", url: "https://forum.code.org/"}
    end

    if ge_teach_config[:requirements] != false
      educate_entries << {title: "educate_requirements", url: CDO.code_org_url("/educate/it")}
    end

    if ge_teach_config[:tools] != false
      educate_entries << {title: "educate_tools", url: CDO.code_org_url("/educate/resources/videos")}
    end

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
    ge_about_config = ge_config[:'about-menu'] || {}
    about_entries = []

    if ge_about_config[:us] != false
      about_entries << {title: "about_us", url: CDO.code_org_url("/about"), id: "about-us"}
    end

    if ge_about_config[:leadership] != false
      about_entries << {title: "about_leadership", url: CDO.code_org_url("/about/leadership")}
    end

    if ge_about_config[:donors] != false
      about_entries << {title: "about_donors", url: CDO.code_org_url("/about/donors")}
    end

    if ge_about_config[:partners] != false
      about_entries << {title: "about_partners", url: CDO.code_org_url("/about/partners")}
    end

    if ge_about_config[:team] != false
      about_entries << {title: "about_team", url: CDO.code_org_url("/about/team")}
    end

    if ge_about_config[:news] != false
      about_entries << {title: "about_news", url: CDO.code_org_url("/about/news")}
    end

    if ge_about_config[:jobs] != false
      about_entries << {title: "about_jobs", url: CDO.code_org_url("/about/jobs")}
    end

    if ge_about_config[:contact] != false
      about_entries << {title: "about_contact", url: CDO.code_org_url("/contact")}
    end

    if ge_about_config[:faqs] != false
      about_entries << {title: "about_faqs", url: CDO.code_org_url("/faq")}
    end

    about_entries.each do |entry|
      entry[:title] = I18n.t("#{loc_prefix}#{entry[:title]}")
    end.freeze

    # Privacy & Legal hamburger dropdown links.
    ge_legal_config = ge_config[:'legal-menu'] || {}

    legal_entries = []

    if ge_legal_config[:privacy] != false
      legal_entries << {title: "legal_privacy", url: CDO.code_org_url("/privacy")}
    end

    if ge_legal_config[:'cookie-notice'] != false
      legal_entries << {title: "legal_cookie_notice", url: CDO.code_org_url("/cookies")}
    end

    if ge_legal_config[:tos] != false
      legal_entries << {title: "legal_tos", url: CDO.code_org_url("/tos")}
    end

    legal_entries.each do |entry|
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
    if ge_config[:learn] != false
      entries << {
        title: I18n.t("#{loc_prefix}learn"),
        url: CDO.code_org_url("/students"),
        class: visibility[:show_pegasus_options] + (hide_small_desktop ? "" : " hide-small-desktop"),
        id: "learn"
      }
    end

    if ge_config[:'teach-menu'] != false
      entries << {
        type: "expander",
        title: I18n.t("#{loc_prefix}teach"),
        id: "educate_entries",
        subentries: educate_entries.each {|e| e[:class] = visibility[:show_pegasus_options]},
        class: visibility[:show_pegasus_options] + (hide_small_desktop ? "" : " hide-small-desktop")
      }
    end

    if ge_config[:districts] != false
      entries << {
        title: I18n.t("#{loc_prefix}districts"),
        url: CDO.code_org_url("/administrators"),
        class: visibility[:show_pegasus_options] + (hide_small_desktop ? "" : " hide-small-desktop"),
        id: "districts"
      }
    end

    if ge_config[:stats] != false
      entries << {
        title: I18n.t("#{loc_prefix}stats"),
        url: CDO.code_org_url("/promote"),
        class: visibility[:show_pegasus_options],
        id: "stats"
      }
    end

    if ge_config[:'help-us'] != false
      entries << {
        title: I18n.t("#{loc_prefix}help_us"),
        url: CDO.code_org_url("/help"),
        class: visibility[:show_pegasus_options],
        id: "help-us"
      }
    end

    if !is_teacher_or_student && (ge_config[:incubator] != false)
      entries << {
        title: I18n.t("#{loc_prefix}incubator"),
        url: CDO.studio_url("/incubator"),
        class: visibility[:show_pegasus_options],
        id: "incubator"
      }
    end

    if ge_config[:'about-menu'] != false
      entries << {
        type: "expander",
        title: I18n.t("#{loc_prefix}about"),
        id: "about_entries",
        subentries: about_entries.each {|e| e[:class] = visibility[:show_pegasus_options]},
        class: visibility[:show_pegasus_options]
      }
    end

    if ge_config[:'legal-menu'] != false
      entries << {
        type: "expander",
        title: I18n.t("#{loc_prefix}legal"),
        id: "legal_entries",
        subentries: legal_entries.each {|e| e[:class] = visibility[:show_pegasus_options]},
        class: visibility[:show_pegasus_options]
      }
    end

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

    ge_region = options[:ge_region]
    ge_config = Cdo::Global.configuration_for(ge_region)[:header] || {}

    any_teacher_links = [
      {title: I18n.t("#{loc_prefix}my_dashboard"), url: CDO.studio_url("/home"), id: "header-teacher-home"},
    ]

    if ge_config[:'course-catalog'] != false
      any_teacher_links << {title: I18n.t("#{loc_prefix}course_catalog"), url: CDO.studio_url("/catalog"), id: "header-teacher-courses"}
    end

    if ge_config[:'project-gallery'] != false
      any_teacher_links << {title: I18n.t("#{loc_prefix}project_gallery"), url: CDO.studio_url("/projects"), id: "header-teacher-projects"}
    end

    if ge_config[:'professional-learning'] != false
      any_teacher_links << {title: I18n.t("#{loc_prefix}professional_learning"), url: CDO.studio_url("/my-professional-learning"), id: "header-teacher-professional-learning"}
    end

    if ge_config[:incubator] != false
      any_teacher_links << {title: I18n.t("#{loc_prefix}incubator"), url: CDO.studio_url("/incubator"), id: "header-teacher-incubator"}
    end

    any_student_links = [
      {title: I18n.t("#{loc_prefix}my_dashboard"), url: CDO.studio_url("/home"), id: "header-student-home"},
    ]

    if ge_config[:'course-catalog'] != false
      any_student_links << {title: I18n.t("#{loc_prefix}course_catalog"), url: CDO.code_org_url("/students"), id: "header-student-courses"}
    end

    if ge_config[:'project-gallery'] != false
      any_student_links << {title: I18n.t("#{loc_prefix}project_gallery"), url: CDO.studio_url("/projects"), id: "header-student-projects"}
    end

    if ge_config[:incubator] != false
      any_student_links << {title: I18n.t("#{loc_prefix}incubator"), url: CDO.studio_url("/incubator"), id: "header-incubator"}
    end

    signed_out_links = []

    if ge_config[:learn] != false
      signed_out_links << {title: I18n.t("#{loc_prefix}learn"), url: CDO.code_org_url("/students"), id: "header-learn"}
    end

    if ge_config[:teach] != false
      signed_out_links << {title: I18n.t("#{loc_prefix}teach"), url: CDO.code_org_url("/teach"), id: "header-teach"}
    end

    if ge_config[:districts] != false
      signed_out_links << {title: I18n.t("#{loc_prefix}districts"), url: CDO.code_org_url("/administrators"), id: "header-districts"}
    end

    if ge_config[:stats] != false
      signed_out_links << {title: I18n.t("#{loc_prefix}stats"), url: CDO.code_org_url("/promote"), id: "header-stats", class: "hide-small-desktop"}
    end

    if ge_config[:'help-us'] != false
      signed_out_links << {title: I18n.t("#{loc_prefix}help_us"), url: CDO.code_org_url("/help"), id: "header-help", class: "hide-small-desktop"}
    end

    if ge_config[:incubator] != false
      signed_out_links << {title: I18n.t("#{loc_prefix}incubator"), url: CDO.studio_url("/incubator"), id: "header-incubator", class: "hide-small-desktop"}
    end

    if ge_config[:about] != false
      signed_out_links << {title: I18n.t("#{loc_prefix}about"), url: CDO.code_org_url("/about"), id: "header-about", class: "hide-small-desktop"}
    end

    if options[:user_type] == "teacher"
      any_teacher_links
    elsif options[:user_type] == "student"
      any_student_links
    else
      signed_out_links
    end
  end
end
