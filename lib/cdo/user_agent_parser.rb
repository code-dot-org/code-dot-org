require 'user_agent_parser'

class UserAgentParser::UserAgent
  def mobile?
    return name =~ /Mobile/
  end

  def cdo_unsupported?
    return name == 'IE' && version.to_s.to_i < 8
  end

  def cdo_partially_supported?
    ver = version.to_s.to_i

    # IE 9+
    return true if name == 'IE' && ver < 9

    # Firefox 10+
    return true if name == 'Firefox' && ver < 10

    # Opera 12+
    return true if name == 'Opera' && ver < 12

    # Safari 5.1.x+
    return true if name == 'Safari' && (ver < 5 || version.to_s =~ /^5\.0/)

    # Default: no browser support warning
    false
  end
end
