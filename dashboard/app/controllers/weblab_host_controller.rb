class WeblabHostController < ApplicationController
  layout false

  BRAMBLE_URL = 'https://downloads.computinginthecore.org/bramble_0.1.30'
  BRAMBLE_LOCALHOST_URL = 'http://127.0.0.1:8000/src'

  def index
    @dev_mode = false; # Change to true to point to Bramble running on localhost
    @bramble_base_url = @dev_mode ? BRAMBLE_LOCALHOST_URL : BRAMBLE_URL
  end
end
