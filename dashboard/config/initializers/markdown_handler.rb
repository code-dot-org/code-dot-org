# Add Markdown .md support to the ActionView template system.

require 'cdo/markdown/handler'

MARKDOWN_OPTIONS = {
  autolink: true,
  tables: true,
  space_after_headers: true
}.freeze

Cdo::Markdown::Handler.register(Redcarpet::Render::HTML, MARKDOWN_OPTIONS)
