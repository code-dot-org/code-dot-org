class CoursesRedirectController < ApplicationController
  include StableIdRedirect

  def show
    redirect_to_code_org('/students')
  end
end
