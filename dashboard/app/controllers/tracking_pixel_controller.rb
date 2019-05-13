class TrackingPixelController < ApplicationController
  def index
    send_file pegasus_dir('sites.v3/code.org/public/images/1x1.png'), type: 'image/png'
  end
end
