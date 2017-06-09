class Hamburger
  def self.get_visibility(options)
    show_teacher_options = "hide-always"
    show_student_options = "hide-always"
    show_signed_out_options = "hide-always"
    show_pegasus_options = "hide-always"
    show_help_options = "hide-always"

    hamburger_class = "none"

    if options[:level]
      # The header is taken over by level-related UI, so we need the hamburger
      # to show whatever would show up in the header at desktop (and mobile) widths.
      show_help_options = "show-always"

      if options[:user_type] == "teacher"
        show_teacher_options = "show-always"
      elsif options[:user_type] == "student"
        show_student_options = "show-always"
      else
        show_signed_out_options = "show-always"
      end

      # Regardless of user type, if they are English, then they also need the pegasus
      # options in the hamburger.
      if options[:language] == "en"
        show_pegasus_options = "show-always"
      end

    else

      # The header is available for showing whichever options we want, but they should
      # appear in the hamburger at mobile widths.
      if options[:user_type] == "teacher"
        show_teacher_options = "show-mobile"
      elsif options[:user_type] == "student"
        show_student_options = "show-mobile"
      else
        show_signed_out_options = "show-mobile"
      end

      if options[:language] == "en"
        # We want to show the pegasus options.  They're in the hamburger for desktop
        # if they didn't fit on the header, or they're just in it for mobile if they did.
        if options[:user_type] == "teacher" || options[:user_type] == "student"
          show_pegasus_options = "show-always"
          show_help_options = "show-always"
        else
          show_pegasus_options = "show-mobile"
          show_help_options = "show-mobile"
        end
      else
        show_help_options = "show-always"
      end
    end

    # Do we show hamburger on all widths, only mobile, or not at all?
    show_set = [show_teacher_options, show_student_options, show_signed_out_options, show_pegasus_options, show_help_options]
    if show_set.include? "show-always"
      hamburger_class = "show-always"
    elsif show_set.include? "show-mobile"
      hamburger_class = "show-mobile"
    else
      hamburger_class = "hide-always"
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
