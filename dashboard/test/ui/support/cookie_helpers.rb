module CookieHelpers
  def debug_cookies(cookies)
    puts "DEBUG: Cookies are: #{CGI::escapeHTML cookies.inspect}"
    puts "DEBUG: Session cookie is: #{CGI::escapeHTML decrypt_cookie(cookies).inspect}"
  end


  def decrypt_cookie(cookies)
    return nil unless cookies
    session_cookie = cookies.select {|cookie| cookie[:name] == '_learn_session_test'}.first
    return nil unless session_cookie

    message = CGI.unescape(session_cookie[:value])

    key_generator = ActiveSupport::KeyGenerator.new(
                                                    CDO.dashboard_secret_key_base,
                                                    iterations: 1000
                                                    )

    encryptor = ActiveSupport::MessageEncryptor.new(
                                                    key_generator.generate_key('encrypted cookie'),
                                                    key_generator.generate_key('signed encrypted cookie')
                                                    )

    encryptor.decrypt_and_verify(message)
  end
end

World(CookieHelpers)
