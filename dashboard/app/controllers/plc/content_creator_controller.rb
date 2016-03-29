class Plc::ContentCreatorController < ApplicationController
  def show_courses_and_modules
    authorize! :manage, Plc::Course

    @courses = Plc::Course.all
    @learning_modules = Plc::LearningModule.all
  end
end
