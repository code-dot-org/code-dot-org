<?php

function codedotorg_alpha_process_html(&$vars) {
  if (drupal_is_front_page()) {
//     $vars['head'] = preg_replace('#<meta property="og:url" content="[^"]+"#is', '<meta property="og:url" content="https://www.facebook.com/video/video.php?v=10100688319184631"', $vars['head']);
  }
}
