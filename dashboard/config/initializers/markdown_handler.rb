require 'nokogiri'
# Add Markdown .md support to the ActionView template system.
module MarkdownHandler
  MARKDOWN_OPTIONS = {
    autolink: true,
    tables: true,
    space_after_headers: true
  }

  # Rewrite youtube iframe elements to use the fallback-player iframe instead
  class YoutubeRewriter < Redcarpet::Render::HTML
    def block_html(html)
      doc = ::Nokogiri::HTML(html)
      nodes = doc.xpath(%w(youtube youtubeeducation).map{|x| "//iframe[@src[contains(.,'#{x}.com/embed')]]"}.join(' | '))
      nodes.each do |node|
        if node['src']
          regex = /(http:|https:)?\/\/(www\.)?(youtube|youtubeeducation)\.com\/embed\/([^"&?\/ ]{11})/
          id = node['src'].match(regex)[4]
          node['src'] = node['src'].sub(
            regex,
            Rails.env.development? ?
              "/videos/embed/#{id}" :
              Rails.application.routes.url_for(controller: 'videos', action: 'embed', key: id)
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
