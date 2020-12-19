class WeblabHostController < ApplicationController
  layout false

  def index
    @dev_mode = false; # Change to true to point to Bramble running on localhost
    @bramble_base_url = @dev_mode ? 'http://127.0.0.1:8000/src' : 'https://downloads.computinginthecore.org/bramble_0.1.29'
  end
end
