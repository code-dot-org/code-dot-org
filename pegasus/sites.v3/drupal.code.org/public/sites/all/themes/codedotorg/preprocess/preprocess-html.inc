<?php

function codedotorg_alpha_preprocess_html(&$vars) {
  // For the mobile front page.
  if (current_path() == 'node/123') {
    // Customize the head title.
    $vars['head_title'] = variable_get('site_name', 'Code.org') . ' | ' . variable_get('site_slogan', 'Dedicated to growing computer programming education');

    // Add a custom class to the body tag.
    $vars['attributes_array']['class'][] = 'mobile-front';
  }

  if (drupal_is_front_page() || current_path() == 'node/123') {
    $vars['mixpanel_js'] = <<<END
<!-- start Mixpanel --><script type="text/javascript">(function(e,b){if(!b.__SV){var a,f,i,g;window.mixpanel=b;a=e.createElement("script");a.type="text/javascript";a.async=!0;a.src=("https:"===e.location.protocol?"https:":"http:")+'//cdn.mxpnl.com/libs/mixpanel-2.2.min.js';f=e.getElementsByTagName("script")[0];f.parentNode.insertBefore(a,f);b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==
  typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,
  e,d])};b.__SV=1.2}})(document,window.mixpanel||[]);
  mixpanel.init("25578877267c53d8341f9228fb9b7cac");</script><!-- end Mixpanel -->

END;
  }

  if (drupal_is_front_page()) {
    $vars['twitter_metatags'] = <<<END
<meta name="twitter:card" content="player">
<meta name="twitter:site" content="@codeorg">
<meta name="twitter:url" content="http://code.org/">
<meta name="twitter:title" content="What most schools don&#39;t teach">
<meta name="twitter:description" content="Learn about a new &quot;superpower&quot; that isn&#39;t being taught in 90% of US schools. Starring Bill Gates, Mark Zuckerberg, will.i.am, Chris Bosh, and Jack Dorsey">
<meta name="twitter:image" content="http://i3.ytimg.com/vi/nKIu9yen5nc/mqdefault.jpg">
<meta name="twitter:player" value="https://www.youtube.com/embed/nKIu9yen5nc">
<meta property="twitter:player:width" content="1920">
<meta property="twitter:player:height" content="1080">

END;
  }

  // Add extra metatags to all pages.
  $vars['extra_metatags'] = <<<END
<meta property="article:publisher" content="https://www.facebook.com/Code.org" />

END;

  // Add an external link to include the Gotham font set.
  drupal_add_css(
    '//cloud.typography.com/7425452/678642/css/fonts.css',
    array('type' => 'external')
  );
}
