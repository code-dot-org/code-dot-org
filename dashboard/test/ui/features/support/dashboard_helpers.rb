require 'cdo/rack/cookie_dcdo'

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

  # Sets DCDO for a test scenario.
  # @see Rack::CookieDCDO
  def set_dcdo(key, value)
    dcdo_cookie = JSON.parse(get_cookie(Rack::CookieDCDO::KEY).try(:[], :value).presence || '{}')

    dcdo_cookie[key] = value

    @browser.manage.add_cookie(name: Rack::CookieDCDO::KEY, value: dcdo_cookie.to_json)
  end
end

World(DashboardHelpers)
