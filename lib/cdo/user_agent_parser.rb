require 'user_agent_parser'

class UserAgentParser::UserAgent
  def mobile?
    !(name =~ /Mobile/).nil?
  end

  def chrome?
    name == 'Chrome'
  end

  def safari?
    name == 'Safari' || name == 'Mobile Safari'
  end

  def ie?
    name == 'IE'
  end

  def firefox?
    name == 'Firefox'
  end

  def opera?
    name == 'Opera'
  end

  def cdo_unsupported?
    return ie? && version && version.major.to_i < 8
  end

  def cdo_partially_supported?
    return false if version.nil?
    ver = version.major.to_i

    # IE 9+
    return true if ie? && ver < 9

    # Firefox 10+
    return true if firefox? && ver < 10

    # Opera 12+
    return true if opera? && ver < 12

    # Safari 5.1.x+
    return true if safari? && (ver < 5 || version.to_s =~ /^5\.0/)

    # Default: no browser support warning
    false
  end
end
