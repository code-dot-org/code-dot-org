class WeblabHostController < ApplicationController
  layout false

  def index
    @bramble_base_url = 'https://downloads.computinginthecore.org/bramble_0.1.29'
    # DEVMODE
    # @bramble_base_url = 'http://127.0.0.1:8000/src'
  end
end
