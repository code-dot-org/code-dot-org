<?php

require_once dirname(__FILE__) . '/includes/omega.inc';
require_once dirname(__FILE__) . '/includes/omega.theme.inc';

/**
 * Implements hook_alpha_regions_alter().
 */
function omega_alpha_regions_alter(&$regions, $theme) {
  foreach ($regions as $region => &$item) {
    $item['equal_height_container'] = alpha_region_get_setting('equal_height_container', $region, FALSE, $theme);
    $item['equal_height_element'] = alpha_region_get_setting('equal_height_element', $region, FALSE, $theme);
  }
}

/**
 * Implements hook_alpha_zones_alter().
 */
function omega_alpha_zones_alter(&$zones, $theme) {
  foreach ($zones as $zone => &$item) {
    $item['equal_height_container'] = alpha_zone_get_setting('equal_height_container', $zone, FALSE, $theme);
  }
}

/**
 * Implements hook_preprocess_html().
 */
function omega_alpha_preprocess_html(&$vars) {
  $theme = alpha_get_theme();
  $vars['rdf'] = new stdClass;

  if (module_exists('rdf')) {
    $vars['doctype'] = '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML+RDFa 1.1//EN">' . "\n";
    $vars['rdf']->version = ' version="HTML+RDFa 1.1"';
    $vars['rdf']->namespaces = $vars['rdf_namespaces'];
    $vars['rdf']->profile = ' profile="' . $vars['grddl_profile'] . '"';
  }
  else {
    $vars['doctype'] = '<!DOCTYPE html>' . "\n";
    $vars['rdf']->version = '';
    $vars['rdf']->namespaces = '';
    $vars['rdf']->profile = '';
  }

  if (alpha_library_active('omega_mediaqueries')) {
    $layouts = array();

    if (isset($theme->grids[$theme->settings['grid']])) {
      foreach ($theme->grids[$theme->settings['grid']]['layouts'] as $layout) {
        if ($layout['enabled']) {
          $layouts[$layout['layout']] = $layout['media'];
        }
      }

      drupal_add_js(array('omega' => array(
        'layouts' => array(
          'primary' => $theme->grids[$theme->settings['grid']]['primary'],
          'order' => array_keys($layouts),
          'queries' => $layouts,
        ),
      )), 'setting');
    }
  }
}

/**
 * Implements hook_preprocess_comment().
 */
function omega_alpha_preprocess_comment(&$vars) {
  // Prepare the arrays to handle the classes and ids for the node container.
  $vars['attributes_array']['class'][] = 'clearfix';

  $vars['datetime'] = format_date($vars['comment']->created, 'custom', 'c');
  $vars['unpublished'] = '';

  if ($vars['status'] == 'comment-unpublished') {
    $vars['unpublished'] = '<div class="unpublished">' . t('Unpublished') . '</div>';
  }
}

/**
 * Implements hook_preprocess_zone().
 */
function omega_alpha_preprocess_zone(&$vars) {
  if (alpha_library_active('omega_equalheights')) {
    if (!empty($vars['elements']['#data']['equal_height_container'])) {
      $vars['content_attributes_array']['class'][] = 'equal-height-container';
    }
  }
}

/**
 * Implements hook_preprocess_region().
 */
function omega_alpha_preprocess_region(&$vars) {
  if (alpha_library_active('omega_equalheights')) {
    if (!empty($vars['elements']['#data']['equal_height_container'])) {
      $vars['content_attributes_array']['class'][] = 'equal-height-container';
    }

    if (!empty($vars['elements']['#data']['equal_height_element'])) {
      $vars['attributes_array']['class'][] = 'equal-height-element';
    }
  }
}

/**
 * Implements hook_preprocess_node().
 */
function omega_alpha_preprocess_node(&$vars) {
  // Prepare the arrays to handle the classes and ids for the node container.
  $vars['attributes_array']['id'] = drupal_html_id('node-' . $vars['type'] . '-' . $vars['nid']);

  // Add a class to allow styling based on publish status.
  if ($vars['status']) {
    $vars['attributes_array']['class'][] = 'node-published';
  }

  // Add a class to allow styling based on promotion.
  if (!$vars['promote']) {
    $vars['attributes_array']['class'][] = 'node-not-promoted';
  }

  // Add a class to allow styling based on sticky status.
  if (!$vars['sticky']) {
    $vars['attributes_array']['class'][] = 'node-not-sticky';
  }

  // Add a class to allow styling of nodes being viewed by the author of the node in question.
  if ($vars['uid'] == $vars['user']->uid) {
    $vars['attributes_array']['class'][] = 'self-posted';
  }

  // Add a class to allow styling based on the node author.
  $vars['attributes_array']['class'][] = drupal_html_class('author-' . $vars['node']->name);

  // Add a class to allow styling for zebra striping.
  $vars['attributes_array']['class'][] = drupal_html_class($vars['zebra']);

  // Add a class to make the node container self clearing.
  $vars['attributes_array']['class'][] = 'clearfix';

  $vars['content_attributes_array']['class'][] = 'content';
  $vars['content_attributes_array']['class'][] = 'clearfix';

  // Adding a class to the title attributes
  $vars['title_attributes_array']['class'][] = 'node-title';
}

/**
 * Implements hook_process_region().
 */
function omega_alpha_process_region(&$vars) {
  if (in_array($vars['elements']['#region'], array('content', 'menu', 'branding'))) {
    $theme = alpha_get_theme();

    switch ($vars['elements']['#region']) {
      case 'content':
        $vars['title_prefix'] = $theme->page['title_prefix'];
        $vars['title'] = $theme->page['title'];
        $vars['title_suffix'] = $theme->page['title_suffix'];
        $vars['tabs'] = $theme->page['tabs'];
        $vars['action_links'] = $theme->page['action_links'];
        $vars['title_hidden'] = $theme->page['title_hidden'];
        $vars['feed_icons'] = $theme->page['feed_icons'];
        break;

      case 'menu':
        $vars['main_menu'] = $theme->page['main_menu'];
        $vars['secondary_menu'] = $theme->page['secondary_menu'];
        break;

      case 'branding':
        $vars['site_name'] = $theme->page['site_name'];
        $vars['linked_site_name'] = l($vars['site_name'], '<front>', array('attributes' => array('title' => t('Home')), 'html' => TRUE));
        $vars['site_slogan'] = $theme->page['site_slogan'];
        $vars['site_name_hidden'] = $theme->page['site_name_hidden'];
        $vars['site_slogan_hidden'] = $theme->page['site_slogan_hidden'];
        $vars['logo'] = $theme->page['logo'];
        $vars['logo_img'] = $vars['logo'] ? '<img src="' . $vars['logo'] . '" alt="' . check_plain($vars['site_name']) . '" id="logo" />' : '';
        $vars['linked_logo_img'] = $vars['logo'] ? l($vars['logo_img'], '<front>', array('attributes' => array('rel' => 'home', 'title' => check_plain($vars['site_name'])), 'html' => TRUE)) : '';
        break;
    }
  }
}

/**
 * Implements hook_process_zone().
 */
function omega_alpha_process_zone(&$vars) {
  $theme = alpha_get_theme();

  if ($vars['elements']['#zone'] == 'content') {
    $vars['messages'] = $theme->page['messages'];
    $vars['breadcrumb'] = $theme->page['breadcrumb'];
  }
}

/**
 * Implements hook_preprocess_block().
 */
function omega_alpha_preprocess_block(&$vars) {
  $theme = alpha_get_theme();

  // Adding a class to the title attributes
  $vars['title_attributes_array']['class'][] = 'block-title';

  // Add odd/even zebra classes into the array of classes
  $vars['attributes_array']['class'][] = $vars['block_zebra'];

  if(empty($vars['block']->subject) && (string) $vars['block']->subject != '0') {
    // Add a class to provide CSS for blocks without titles.
    $vars['attributes_array']['class'][] = 'block-without-title';
  }

  if ($vars['block']->module != 'alpha-debug' && isset($vars['block']->region)) {
    if (alpha_library_active('omega_equalheights') && isset($theme->regions[$vars['block']->region])) {
      if ($theme->regions[$vars['block']->region]['equal_height_container']) {
        $vars['attributes_array']['class'][] = 'equal-height-element';
      }
    }
  }
}
