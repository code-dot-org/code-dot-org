<?php

function codedotorg_alpha_preprocess_region(&$vars) {
  switch ($vars['elements']['#region']) {
    case 'preface_first':
      // Add clearfix class for background.
      $vars['content_attributes_array']['class'][] = 'clearfix';
      break;
  }
}
