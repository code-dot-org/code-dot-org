require 'browser'

class Browser
  # Change the browser.modern? rules to use a conservative blacklist instead of a whitelist
  self.modern_rules.clear

  self.modern_rules << ->(b) {
    ver = b.version.to_i

    # IE 9+
    return false if b.ie? && ver < 9

    # Firefox 10+
    return false if b.firefox? && ver < 10

    # Opera 12+
    return false if b.opera? && ver < 12

    # Safari 5.1.x+
    return false if b.safari && (ver < 5 || b.full_version =~ /5\.0/)

    # Default: no browser support warning
    true
  }

  # Browsers we don't support and never plan to support fully
  def self.unsupported?
    return self.ie? && self.version.to_i < 8
  end
end
