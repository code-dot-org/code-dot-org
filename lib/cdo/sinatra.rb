require 'sinatra/base'

class Sinatra::Base
  # Patch Sinatra 2.x to allow anchors in regexp patterns,
  # to match 1.x behavior.
  # Ref: https://github.com/sinatra/sinatra/issues/1178
  def self.compile(path)
    opts = path.is_a?(Regexp) ? {check_anchors: false} : {}
    Mustermann.new(path, opts)
  end

  def self.get_or_post(url,&block)
    get(url, &block)
    post(url, &block)
  end
end
