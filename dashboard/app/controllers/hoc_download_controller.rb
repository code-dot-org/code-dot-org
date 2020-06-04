class HocDownloadController < ApplicationController
  def index
    @product_name = params[:product]
    @hoc_url = CDO.code_org_url(@product_name, 'https:')
    @download_urls = {}

    languages = ['Albanian', 'Arabic', 'Azerbaijani', 'Basque', 'Bosnian', 'Bulgarian', 'Catalan', 'Chinese-Taiwan', 'Chinese', 'Croatian', 'Czech', 'Danish', 'Dutch', 'English', 'Finnish', 'French', 'German', 'Greek', 'Hebrew', 'Hungarian', 'Icelandic', 'Indonesian', 'Italian', 'Japanese', 'Korean', 'Latvian', 'Lithuanian', 'Norwegian', 'Norwegian-Nynorsk', 'Polish', 'Portuguese-Brazil', 'Portuguese', 'Romanian', 'Russian', 'Serbian', 'Slovenian', 'Spanish', 'Swedish', 'Turkish', 'Ukrainian', 'Vietnamese']

    case @product_name
      when Script::MINECRAFT_NAME
        @app_name = t('hoc_download.minecraft_name')
        @file_prefix = 'MC'
        @og_image_url = CDO.code_org_url('/images/mc/mc_social.jpg')
      when Script::STARWARS_NAME
        @app_name = t('hoc_download.starwars_blocks_name')
        @file_prefix = 'StarWarsBlocks'
        @og_image_url = CDO.code_org_url('/images/star-wars-announcement.jpg')

        # for JavaScript version (Star Wars only)
        @app_name_js = t('hoc_download.starwars_javascript_name')
        @file_prefix_js = 'StarWarsJS'
        @show_js_links = true
      else
        render_404
        return
    end

    languages.each do |lang|
      @download_urls[:"#{lang}_windows_url"] = download_url(@product_name, @file_prefix, "#{lang}Setup.exe")
      @download_urls[:"#{lang}_mac_url"] = download_url(@product_name, @file_prefix, "#{lang}.dmg")
    end

    if @show_js_links
      languages.each do |lang|
        @download_urls[:"#{lang}_windows_url_js"] = download_url(@product_name, @file_prefix_js, "#{lang}Setup.exe")
        @download_urls[:"#{lang}_mac_url_js"] = download_url(@product_name, @file_prefix_js, "#{lang}.dmg")
      end
    end
  end

  DOWNLOAD_URL_BASE = '//downloads.code.org/hourofcode/'.freeze
  def download_url(product_name, file_prefix, file_name)
    "#{DOWNLOAD_URL_BASE}#{product_name}/#{file_prefix}#{file_name}"
  end
end
