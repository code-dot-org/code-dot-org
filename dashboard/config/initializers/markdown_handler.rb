require 'nokogiri'
# Add Markdown .md support to the ActionView template system.
module MarkdownHandler
  MARKDOWN_OPTIONS = {
    autolink: true,
    tables: true,
    space_after_headers: true
  }

  # Rewrite YouTube iframe elements to use the fallback-player iframe instead.
  class YoutubeRewriter < Redcarpet::Render::HTML

    # YouTube video IDs must be 11 characters and contain no invalid characters, such as exclamation points or asterisks.
    # Ref: https://developers.google.com/youtube/iframe_api_reference (events|onError|2)
    VIDEO_ID_REGEX = /[^!*"&?\/ ]{11}/
    # YouTube embed URL has the following format: http://www.youtube.com/embed/VIDEO_ID
    # Ref: https://developers.google.com/youtube/player_parameters#Manual_IFrame_Embeds
    EMBED_URL_REGEX = /(?:http[s]?:)?\/\/(?:www\.)?(?:youtube(?:education)?)\.com\/embed\/(?<id>#{VIDEO_ID_REGEX})/

    def block_html(html)
      doc = ::Nokogiri::HTML(html)
      nodes = doc.xpath(%w(youtube youtubeeducation).map{|x| "//iframe[@src[contains(.,'#{x}.com/embed')]]"}.join(' | '))
      nodes.each do |node|
        if node['src']
          id = node['src'].match(EMBED_URL_REGEX)[:id]
          node['src'] = node['src'].sub(
            EMBED_URL_REGEX,
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
