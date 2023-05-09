class WeblabHostController < ApplicationController
  BRAMBLE_URL = 'https://downloads.computinginthecore.org/bramble_0.1.31'
  BRAMBLE_LOCALHOST_URL = 'http://127.0.0.1:8000/src'
  STUDIO_URL = CDO.studio_url('', CDO.default_scheme)

  def index
    @dev_mode = false # Change to true to point to Bramble running on localhost
    @bramble_base_url = @dev_mode ? BRAMBLE_LOCALHOST_URL : BRAMBLE_URL
    @studio_url = STUDIO_URL
    @skip_files = params[:skip_files] == "true" # Special case for checking that Bramble can be initialized without loading files
    render layout: false
  end

  def network_check
    @studio_url = STUDIO_URL
  end
end
