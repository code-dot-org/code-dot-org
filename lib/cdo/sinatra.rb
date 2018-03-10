require 'sinatra/base'

class Sinatra::Base
  def self.get_or_post(url, &block)
    get(url, &block)
    post(url, &block)
  end
end
