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
end
