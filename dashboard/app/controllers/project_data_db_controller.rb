class ProjectDataDbController < ApplicationController

  # GET /datasets
  def index
    @project = Project.find_by_channel_id(params[:channel_id])
    puts "####################################################"
  end

  def getKeyValue
  end

  def setKeyValue
    #puts "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!setkeyvalue"

    render html: '<div>setKeyValue returned</div>'.html_safe
  end

  def createRecord
  end

  def readRecords
  end

  def updateRecord
  end

  def deleteRecord
  end
  
end
