module BrowsersHelper

  def mobile?(agent = request.user_agent)
    return true if agent =~ /\b(iPad|urbanpad)\b/
    return true if agent =~ /BlackBerry|BB10.*mobile/i
    return true if agent =~ /Android/
    return true if agent =~ /\b(iPhone|iPod|CFNetwork)\b/
    return true if agent =~ /Windows Phone/

    #return true if agent =~ /^(?:ASTEL|AU-MIC|DoCoMo|J-PHONE|mot|Nokia|PDXGW|SEC|SonyEricsson|UPG1|Vodafone|Xiino)/i
    #return true if agent =~ /\b(?:Android|AvantGo|Danger|DDIPOCKET|Elaine|embedix|maemo|MIDP|NetFront|nokia\d+|Opera Mini|Palm(OS|Source)|PlayStation|ProxiNet|RegKing|ReqwirelessWeb|SonyEricsson|Symbian ?OS|TELECA|Twitt[a-z]+|UP\.Browser|WinWAPDashMR|Windows CE|Pre)\b/i
    false
  end

  def phone?(agent = request.user_agent)
    # return true if agent =~ /\b(iPad|urbanpad)\b/
    return true if agent =~ /BlackBerry|BB10.*mobile/i
    return true if agent =~ /Android.*Mobile/
    return true if agent =~ /\b(iPhone|iPod|CFNetwork)\b/
    return true if agent =~ /Windows Phone/

    #return true if agent =~ /^(?:ASTEL|AU-MIC|DoCoMo|J-PHONE|mot|Nokia|PDXGW|SEC|SonyEricsson|UPG1|Vodafone|Xiino)/i
    #return true if agent =~ /\b(?:Android|AvantGo|Danger|DDIPOCKET|Elaine|embedix|maemo|MIDP|NetFront|nokia\d+|Opera Mini|Palm(OS|Source)|PlayStation|ProxiNet|RegKing|ReqwirelessWeb|SonyEricsson|Symbian ?OS|TELECA|Twitt[a-z]+|UP\.Browser|WinWAPDashMR|Windows CE|Pre)\b/i
    false
  end

  # Returns ie version or 0 if not ie (note: IE11 removes MSIE from the UA string and will have ie_version=0)
  def ie_version
    match = /MSIE (\d.\d*)/.match(request.user_agent)
    match ? match[1].to_i : 0
  end

  # Returns Chrome major version or 0 if not Chrome
  def chrome_version
    match = /Chrome\/(\d+)\./.match(request.user_agent)
    match ? match[1].to_i : 0
  end

  # Return Firefox major version or 0 if not Firefox
  def firefox_version
    match = /Firefox\/(\d+)\./.match(request.user_agent)
    match ? match[1].to_i : 0
  end

  # Returns Safari major version or 0 if not Safari
  def safari_version(agent = request.user_agent)
    return 0 unless chrome_version == 0 && agent =~ /Safari/
    match = /Version\/(\d+)\./.match(agent)
    match ? match[1].to_i : 0
  end
end
