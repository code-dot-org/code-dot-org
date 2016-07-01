# Monkey patch NewRelic to avoid including NewRelic instrumentation for unsupported
# browsers (IE9 or earlier.)
module NewRelic
  module Agent
    def exclude_from_deprecated_browsers(script_tag)
      return '' if script_tag == ''

      # The following guard will prevent versions of IE <= 9 from processing
      # the script_tag while exposing it to IE10+ and other browsers.
      # We then follow it with a script that will disable NewRelic on IE10, tho
      # unlike the IE <=9 case, will still result in us loading the script
      result = "<!--[if !IE]><!--> " +
        "#{script_tag} " +
        "<script>if (navigator.userAgent.match('MSIE 10.0;')) { delete window.NREUM; }</script>" +
        "<!--<![endif]-->"

      # Mark the result as html_safe in Rails.
      result = result.html_safe if result.respond_to? :html_safe

      result
    end

    alias_method :base_browser_timing_header, :browser_timing_header
    def browser_timing_header
      exclude_from_deprecated_browsers(base_browser_timing_header)
    end
  end
end
