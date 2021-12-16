class SpriteManagementController < ApplicationController
  before_action :require_levelbuilder_mode
  before_action :authenticate_user!

  def index
    render 'sprite_management/sprite_management_directory'
  end

  def sprite_upload
  end

  def default_sprites_editor
  end

  def select_start_animations
  end
end
