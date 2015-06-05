require 'cdo/rack/deflater'
module Rack
  class CdoDeflater < Deflater
    def initialize(app, options = {})
      super(app, options.merge(
          if: lambda {|_, _, _, body| body.length > 1024},
          include: %w(
            application/javascript
            application/json
            application/x-javascript
            application/xml
            application/xml+rss
            text/css
            text/html
            text/javascript;
            text/plain
            text/xml
          )
        ))
    end
  end
end
