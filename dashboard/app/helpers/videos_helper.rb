module VideosHelper
  def youtube_base_url
    Video.youtube_base_url
  end

  def embedded_video(video)
    "<iframe src='#{embed_url(video.key)}' scrolling='no'></iframe>"
  end

  def embed_url(key)
    "/videos/embed/#{key}"
  end

  def video_thumbnail_url(video)
    asset_url(video.thumbnail_path)
  end

  def video_info(video, autoplay = true)
    video.summarize language, autoplay
  end
end
