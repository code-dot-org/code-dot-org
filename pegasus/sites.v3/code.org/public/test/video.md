---
title: Video player test
---

# Popup video player test

<a onclick="return showVideo_video1()" style="cursor:pointer">
  Video 1
</a>

<%= view :display_video_lightbox, id: "video1", video_code: "h5_SsNSaJJI" %>


<a onclick="return showVideo_video2()" style="cursor:pointer">
  Video 2
</a>

<%= view :display_video_lightbox, id: "video2", video_code: "nKIu9yen5nc", facebook: {:u=>"http://#{request.site}/"}, download_filename: "download.mov" %>
