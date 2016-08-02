class HocDownloadController < ApplicationController

  def index
    @product_name = params[:product]

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

    @hoc_url = CDO.code_org_url("/#{@product_name}")

    @english_windows_url = download_url(@product_name,@file_prefix,"EnglishSetup.exe")
    @english_mac_url = download_url(@product_name,@file_prefix,"English.dmg")
    @spanish_windows_url = download_url(@product_name,@file_prefix,"SpanishSetup.exe")
    @spanish_mac_url = download_url(@product_name,@file_prefix,"Spanish.dmg")

    if @show_js_links
      @english_windows_url_js = download_url(@product_name,@file_prefix_js,"EnglishSetup.exe")
      @english_mac_url_js = download_url(@product_name,@file_prefix_js,"English.dmg")
      @spanish_windows_url_js = download_url(@product_name,@file_prefix_js,"SpanishSetup.exe")
      @spanish_mac_url_js = download_url(@product_name,@file_prefix_js,"Spanish.dmg")
    end
  end

  DOWNLOAD_URL_BASE = '//downloads.code.org/hourofcode/'
  def download_url(product_name, file_prefix, file_name)
    "#{DOWNLOAD_URL_BASE}#{product_name}/#{file_prefix}#{file_name}"
  end
end
