# Add Markdown .md support to the ActionView template system.

require 'cdo/markdown/handler'
require 'cdo/markdown/renderer'

Cdo::Markdown::Handler.register(Cdo::Markdown::Renderer, Cdo::Markdown::Renderer::OPTIONS)
