class CodeprojectsPreviewController < ApplicationController
  # Public preview page, static content for now.
  def show
    render 'show', layout: false
  end

  # Serve preview assets
  def asset
    Rails.logger.info "Asset request: #{params[:path]}"
    asset_path = Rails.root.join('public', 'blockly', 'js', 'preview', params[:path])
    Rails.logger.info "Looking for asset at: #{asset_path}"
    Rails.logger.info "File exists: #{File.exist?(asset_path)}"
    if File.exist?(asset_path)
      send_file asset_path, type: 'application/javascript', disposition: 'inline'
    else
      # Try without the 'js' subdirectory
      asset_path = Rails.root.join('public', 'blockly', 'preview', params[:path])
      Rails.logger.info "Trying alternative path: #{asset_path}"
      Rails.logger.info "File exists: #{File.exist?(asset_path)}"
      if File.exist?(asset_path)
        send_file asset_path, type: 'application/javascript', disposition: 'inline'
      else
        render plain: "Asset not found: #{params[:path]}", status: :not_found
      end
    end
  end
end
