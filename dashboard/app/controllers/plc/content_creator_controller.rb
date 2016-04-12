class Plc::ContentCreatorController < ApplicationController
  def show_courses_and_modules
    authorize! :manage, Plc::Course

    @courses = Plc::Course.all
  end
end
