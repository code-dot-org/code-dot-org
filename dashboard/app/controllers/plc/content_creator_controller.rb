class Plc::ContentCreatorController < ApplicationController
  before_filter :require_levelbuilder_mode

  def show_courses_and_modules
    @courses = Plc::Course.all
    @learning_modules = Plc::LearningModule.all
  end
end
