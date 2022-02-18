class OfflineController < ApplicationController
  # Join offline pilot
  def set_offline_cookie
    cookies[:offline_pilot] = {value: true, domain: :all, expires: 1.year.from_now}
    redirect_to '/home'
  end

  def offline_service_worker
    file_path = webpack_asset_path('js/offline-service-worker.js', true)
    # TODO: This path is probably wrong.
    send_file(apps_dir('build/package/js/' + file_path), type: 'application/javascript')
  end
end
