# Video Fallback Player

Certain schools block [youtube.com](http://youtube.com), where our videos are embedded from.

As a fallback, we display the downloadable copy of our videos using video.js.

## Networking / firewall needs

### For native YouTube videos:

Whitelist:

* https://s.youtube.com
* https://www.youtube.com
* https://*.googlevideo.com
* https://*.ytimg.com

### For the non-YouTube code.org fallback video player

Whitelist:

* https://videos.code.org/*

Blacklist:

* https://www.youtube.com — specifically https://www.youtube.com/favicon.ico (this is how we detect to serve the fallback player)

## Software needs for the non-YouTube fallback player

* Chrome: should always work (player will try Flash first, if not available, will use HTML5 player)
* Firefox: for fallback player, need to have Flash player installed
* Safari: for fallback player, have Flash player installed (it may still work when Flash is uninstalled, I haven't been able to test this case)
* iOS / Android: should always work

# Detecting missing video

We use the technique from Khan Academy's [YouTube fallback](http://code.google.com/p/khanacademy/issues/detail?id=13721), testing `img` loading of `youtube.com/favicon.ico`.

Since youtubeeducation.com does not have a favicon.ico, we are using youtube.com as the default video address and fallback host. 

We will use the fallback player if either:

1. You visit a url with `?force_youtube_fallback` in it
2. jQuery detects an error when loading https://www.youtube.com/favicon.ico

# Video.js

To display our fallback videos, we use video.js with files served from our server through the Rails asset pipeline. This includes files in `vendor/assets/[fonts, javascripts, stylesheets, flash]`.

These videos are loaded from our video download host: http://videos.code.org/

# Manually testing YouTube blocked behavior

For a semi-decent simulation of blocked YouTube, add `?force_youtube_fallback` to the URL. This is how our UI tests 

## Fake-blocking YouTube

```
sudo vim /etc/hosts
# insert:
127.0.0.1       www.youtube.com
127.0.0.1       youtube.com
127.0.0.1       youtubeeducation.com
127.0.0.1       www.youtubeeducation.com
127.0.0.1       ytimg.com
```

### Using Charles

[Charles](http://www.charlesproxy.com/) is an HTTP proxy, throttling, monitoring power tool.

You can use Charles to block certain hosts and to monitor where requests are being made.

To block certain hosts, go to the Blacklist tool or right click on a request that's been captured and check blacklist.

## Firefox: Fake-blocking Flash

Firefox does not support HTML5 video playing of mp4 video files, so we want to consider the cases of:

1. Firefox visitors with Flash player
2. Firefox visitors without Flash player

To test how the page looks with Firefox without Flash, use the [FlashDisable](https://addons.mozilla.org/en-US/firefox/addon/flashdisable/) Firefox extension.

## Resetting session to show videos

Hit the local endpoint [http://localhost:3000/reset_session](http://localhost:3000/reset_session) to reset your session and the video will show again.

## On BrowserStack Live

Using [BrowserStack Live](http://www.browserstack.com/start), click to begin local testing. Enter the following parameters:

![](http://i.imgur.com/mzocimK.png)

*After* starting the local tunnel, follow the instructions for fake-blocking YouTube in your `/etc/hosts` above as well. This must be done *after* connecting to BrowserStack to avoid BrowserStack's tunnel host connection checker.
