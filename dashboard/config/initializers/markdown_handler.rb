require 'nokogiri'
# Add Markdown .md support to the ActionView template system.
module MarkdownHandler
  MARKDOWN_OPTIONS = {
    autolink: true,
    tables: true,
    space_after_headers: true
  }.freeze

  # Rewrite YouTube iframe elements to use the fallback-player iframe instead.
  class YoutubeRewriter < Redcarpet::Render::HTML
    def block_html(html)
      doc = ::Nokogiri::HTML(html)
      nodes = doc.xpath(%w(youtube youtubeeducation).map{|x| "//iframe[@src[contains(.,'#{x}.com/embed')]]"}.join(' | '))
      nodes.each do |node|
        if node['src']
          id = node['src'].match(Video::EMBED_URL_REGEX)[:id]
          node['src'] = node['src'].sub(
            Video::EMBED_URL_REGEX,
            Video.embed_url(id)
          )
        end
      end
      doc.css('body').children.to_html
    end
  end

  def self.call(template)
    @markdown ||= Redcarpet::Markdown.new(YoutubeRewriter, MARKDOWN_OPTIONS)
    "#{@markdown.render(template.source).inspect}.html_safe"
  end
end

ActionView::Template.register_template_handler :md, MarkdownHandler
