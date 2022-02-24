class OfflineController < ApplicationController
  # Join offline pilot
  def set_offline_cookie
    cookies[:offline_pilot] = {value: true, domain: :all, expires: 1.year.from_now}
    redirect_to '/home'
  end

  # Responds with the offline-service-worker.js file.
  def offline_service_worker
    file_path = webpack_offline_asset_path('js/offline-service-worker.js')
    send_file(dashboard_dir('public', 'blockly', 'js', file_path), type: 'application/javascript')
  end
end
