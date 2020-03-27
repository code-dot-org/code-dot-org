# Add Markdown .md support to the ActionView template system.

require 'cdo/markdown_handler'

MARKDOWN_OPTIONS = {
  autolink: true,
  tables: true,
  space_after_headers: true
}.freeze

MarkdownHandler.register(Redcarpet::Render::HTML, MARKDOWN_OPTIONS)
