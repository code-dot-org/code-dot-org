require 'cdo/rack/request'

module Rack; class Request

  def self.localized_uris()
    [
      '/',
      '/learn',
      '/learn/beyond',
      '/congrats',
      '/language_test',
      '/teacher-dashboard',
      '/teacher-dashboard/landing',
      '/teacher-dashboard/nav',
      '/teacher-dashboard/section_manage',
      '/teacher-dashboard/section_progress',
      '/teacher-dashboard/sections',
      '/teacher-dashboard/signin_cards',
      '/teacher-dashboard/student'
    ]
  end

  def self.locales_supported()
    @@locales_supported ||= Dir.glob(cache_dir('i18n/*.yml')).map{|i| ::File.basename(i, '.yml').downcase}.sort
  end

  def language()
    @pegasus_language ||= env['HTTP_X_VARNISH_ACCEPT_LANGUAGE'] if Request.localized_uris.include?(path_info)
    @pegasus_language ||= 'en'
  end

  def locale()
    @pegasus_locale ||= locale_()
  end

  def locale_()
    desired = language.downcase
    locale = Request.locales_supported.find{|i| i==desired || i.split('-').first==desired}
    locale ||= 'en-us'

    parts = locale.split('-')
    return "#{parts[0]}-#{parts[1].upcase}"
  end

end; end
