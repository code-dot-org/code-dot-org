require 'nokogiri'
require 'cdo/markdown_handler'

# Add Markdown .md support to the ActionView template system.
MARKDOWN_OPTIONS = {
  autolink: true,
  tables: true,
  space_after_headers: true
}.freeze

class CustomRewriter < Redcarpet::Render::HTML
  # Rewrite YouTube iframe elements to use the fallback-player iframe instead.
  def block_html(html)
    doc = ::Nokogiri::HTML(html)
    nodes = doc.xpath(%w(youtube youtubeeducation youtube-nocookie).map {|x| "//iframe[@src[contains(.,'#{x}.com/embed')]]"}.join(' | '))
    nodes.each do |node|
      next unless node['src']
      id = node['src'].match(Video::EMBED_URL_REGEX)[:id]
      node['src'] = node['src'].sub(
        Video::EMBED_URL_REGEX,
        Video.embed_url(id)
      )
    end
    doc.css('body').children.to_html
  end

  # Open links in a new tab by default.
  def link(link, title, content)
    # `content` is already escaped by Redcarpet.
    "<a target='_blank' href='#{Rack::Utils.escape_html(link)}' title='#{Rack::Utils.escape_html(title)}'>#{content}</a>"
  end

  def autolink(link, _)
    link(link, nil, link)
  end
end

MarkdownHandler.register(CustomRewriter, MARKDOWN_OPTIONS)
