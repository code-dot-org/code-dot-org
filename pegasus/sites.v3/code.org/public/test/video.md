---
title: Video player test
---

# Popup video player test

## video 1

In this technique, give us a thumbnail image and optional caption, and we'll make it clickable and add a play button.  

(This example just has a video in the popup.)

<%= view :display_video_thumbnail, id: "video1", image: "/images/test-video-sample.jpg", video_code: "h5_SsNSaJJI", caption: "Video 1" %>


## video 2

In this technique, set up something that's clickable, and then we'll take care of popping the video.  

(This example has the video, a facebook share link, and a downloadable file link in the popup.)

<span onclick="return showVideo_video2()" style="cursor:pointer" class="video_caption_link">
  Video 2
</span>

<%= view :display_video_lightbox, id: "video2", video_code: "nKIu9yen5nc", facebook: {:u=>"http://#{request.site}/"}, download_filename: "download.mov" %>
