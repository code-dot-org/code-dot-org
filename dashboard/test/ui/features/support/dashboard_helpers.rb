module DashboardHelpers
  # Requires the full rails environment. Use sparingly, known to take 20-30s.
  def require_rails_env
    return if @rails_loaded
    puts 'Requiring rails env'
    start = Time.now
    require File.expand_path('../../../../../config/environment.rb', __FILE__)
    finish = Time.now
    puts "Requiring rails env took #{finish - start} seconds"
    @rails_loaded = true
  end

  def set_dcdo(key, value)
    cookie_dcdo =
      begin
        JSON.parse(@browser.manage.cookie_named('DCDO').try(:[], :value).presence || '{}')
      rescue Selenium::WebDriver::Error::NoSuchCookieError
        {}
      end

    cookie_dcdo[key] = value

    @browser.manage.add_cookie(name: 'DCDO', value: cookie_dcdo.to_json)
  end
end

World(DashboardHelpers)
