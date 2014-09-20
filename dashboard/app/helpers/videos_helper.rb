module VideosHelper
  def youtube_url(code, args={})
    defaults = {
        v: code,
        modestbranding: 1,
        rel: 0,
        showinfo: 1,
        autoplay: 1,
        wmode: 'transparent',
        iv_load_policy: 3
    }
    if language != 'en'
      defaults.merge!(
          cc_lang_pref: language,
          cc_load_policy: 1
      )
    end
    defaults.merge!(args)
    "#{youtube_base_url}/embed/#{code}/?#{defaults.to_query}"
  end

  def youtube_base_url
    'https://www.youtube.com'
  end

  def embedded_video(video)
    "<iframe src='#{embed_url(video.key)}' scrolling='no'></iframe>"
  end

  def embed_url(key)
    "/videos/embed/#{key}"
  end

  def video_thumbnail_url(video)
    asset_url(video_thumbnail_path(video))
  end

  def video_thumbnail_path(video)
    "/c/video_thumbnails/#{video.id}.jpg"
  end

  def video_info(video, autoplay = true)
    # Note: similar video info is also set in javascript at levels/_blockly.html.haml
    {
        src: youtube_url(video.youtube_code, {autoplay: autoplay ? 1 : 0}),
        key: video.key,
        name: data_t('video.name', video.key),
        download: video.download,
        thumbnail: video_thumbnail_path(video),
        enable_fallback: true,
        autoplay: autoplay
    }
  end
end
