<?php

function codedotorg_alpha_process_region(&$vars) {
  $theme = alpha_get_theme();

  switch ($vars['elements']['#region']) {
    case 'content':
      if (drupal_is_front_page() || current_path() == 'node/123') {
        $vars['title'] = '';
      }

      // Hide titles for certain nodes.
      if (isset($vars['elements']['system_main']['nodes'])) {
        $nids = element_children($vars['elements']['system_main']['nodes']);
        if (in_array($nids[0], array(31, 106, 107, 108, 109))) {
          $vars['title_hidden'] = 1;
        }
      }
      break;

    case 'menu':
      // Remove the secondary menu from the Menu region.
      $vars['secondary_menu'] = NULL;
      break;

    case 'menu_second':
      // Add the secondary menu to the Secondary Menu region.
      $vars['secondary_menu'] = $theme->page['secondary_menu'];
      break;
  }
}
