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

  # https://support.code.org/hc/en-us/articles/202591743
  # has the list of browsers we support
  def cdo_unsupported?
    return false if version.nil?
    ver = version.major.to_i

    return true if ie? && ver < 8
    return true if firefox? && ver < 24
    return true if opera? && ver < 12
    return true if safari? && (ver < 6 || version.to_s =~ /^6\.0/)
    return true if chrome? && ver < 32

    # Default: no browser support warning
    false
  end
end
