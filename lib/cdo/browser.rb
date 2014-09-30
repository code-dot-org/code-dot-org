require 'browser'

class Browser
  # Browsers we don't support and never plan to support fully
  def unsupported?
    return ie? && version.to_i < 8
  end

  # Returns false for browsers known to have issues on studio.code.org
  def cdo_modern?
    ver = version.to_i

    # IE 9+
    return false if ie? && ver < 9

    # Firefox 10+
    return false if firefox? && ver < 10

    # Opera 12+
    return false if opera? && ver < 12

    # Safari 5.1.x+
    return false if safari? && (ver < 5 || full_version =~ /5\.0/)

    # Default: no browser support warning
    true
  end

  def cdo_name
    ie? ? "#{name} #{version}" : name
  end
end

# Change the browser.modern? rules to use a conservative blacklist instead of a whitelist
Browser.modern_rules.clear
Browser.modern_rules << ->(b) { b.cdo_modern? }
