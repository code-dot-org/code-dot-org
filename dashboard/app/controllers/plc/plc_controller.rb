class Plc::PlcController < ApplicationController
  # GET /plc
  def index
    authorize! :manage, Plc::Course
    render 'plc/index'
  end
end
