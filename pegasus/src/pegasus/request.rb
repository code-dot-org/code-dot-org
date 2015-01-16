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

end; end
