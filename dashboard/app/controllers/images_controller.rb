class ImagesController < ApplicationController
  before_action :authenticate_user!, except: [:test]
  before_action :require_levelbuilder_mode, except: [:test, :index]
  check_authorization except: [:test]
  load_and_authorize_resource except: [:test]

  def new
  end
end
