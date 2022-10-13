class OfflineController < ApplicationController
  # Join offline pilot
  def set_offline_cookie
    cookies[:offline_pilot] = {value: true, domain: :all, expires: 1.year.from_now}
    redirect_to "/home"
  end

  # Needed, otherwise Rails will reject requests due to CSRF
  skip_before_action :verify_authenticity_token, only: :offline_service_worker
  # Responds with the offline-service-worker.js or .js.map files.
  def offline_service_worker
    filename = ActiveStorage::Filename.new(params[:file]).sanitized
    send_file(dashboard_dir("public", "blockly", "js", filename), type: "application/javascript")
  end

  # Responds with a JSON object which contains a list of files which should be cached for offline use.
  def offline_files
    # Load the image and mp3 assets used by 'birds' levels.
    bird_paths = Dir.glob('blockly/media/skins/birds/*', base: 'public/')
    bird_asset_paths = bird_paths.map {|path| helpers.asset_path(path, skip_pipeline: true)}

    # Load fonts distributed by dashboard
    font_asset_paths = Dir.glob('*.*', base: 'public/fonts').map {|path| helpers.asset_path(path)}

    level_paths = (1..13).map {|n| "/s/express-2021/lessons/1/levels/#{n}"}

    render json: {
      files: [
        "/s/express-2021/lessons/1/manifest.webmanifest",
        helpers.asset_path("application.js"),
        webpack_asset_path("js/webpack-runtime.js"),
        webpack_asset_path("js/essential.js"),
        webpack_asset_path("js/vendors.js"),
        webpack_asset_path("js/#{locale_code}/common_locale.js"),
        webpack_asset_path("js/#{locale_code}/blockly_locale.js"),
        webpack_asset_path("js/#{locale_code}/maze_locale.js"),
        webpack_asset_path("js/levels/_teacher_panel.js"),
        webpack_asset_path("js/code-studio.js"),
        webpack_asset_path("js/code-studio-common.js"),
        webpack_asset_path("js/common.js"),
        webpack_asset_path("js/levels/show.js"),
        webpack_asset_path("js/layouts/_small_footer.js"),
        webpack_asset_path("js/blockly.js"),
        helpers.asset_path("css/code-studio.css"),
        helpers.asset_path("application.css"),
        helpers.asset_path("logo.svg"),
        helpers.asset_path("shared/images/Powered-By_logo-horiz_RGB_REV.png", skip_pipeline: true),
        helpers.asset_path("shared/images/user-not-signed-in.png", skip_pipeline: true),
        helpers.asset_path("css/levels.css"),
        helpers.asset_path("css/common.css"),
        helpers.asset_path("css/maze.css"),
        webpack_asset_path("js/maze.js"),
        helpers.asset_path("c/video_thumbnails/CSF_maze_intro_text_blocks.jpg", skip_pipeline: true),
        helpers.asset_path("spinner-big.gif"),
        helpers.asset_path("blockly/media/common_images/shared-sprites-26x26.png", skip_pipeline: true),
        helpers.asset_path("blockly/media/canclosed.png", skip_pipeline: true),
        helpers.asset_path("blockly/media/canopen.png", skip_pipeline: true),
        helpers.asset_path("blockly/media/click.mp3", skip_pipeline: true),
        helpers.asset_path("blockly/media/delete.mp3", skip_pipeline: true),
        helpers.asset_path("blockly/media/handopen.cur", skip_pipeline: true),
        helpers.asset_path("x_button.png"),
        helpers.asset_path("blockly/media/1x1.gif", skip_pipeline: true),
        '/favicon.ico',
        '/shared/css/hamburger.css'
      ].concat(bird_asset_paths, font_asset_paths, level_paths)
    }
  end

  def locale_code
    request.locale.to_s.downcase.tr("-", "_")
  end
end
