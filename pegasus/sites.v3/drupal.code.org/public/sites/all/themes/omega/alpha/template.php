<?php

require_once dirname(__FILE__) . '/includes/alpha.inc';
require_once dirname(__FILE__) . '/includes/base.inc';

/**
 * Implements hook_theme().
 */
function alpha_theme($existing, $type, $theme, $path) {
  return array(
    'section' => array(
      'template' => 'section',
      'path' => $path . '/templates',
      'render element' => 'elements',
      'pattern' => 'section__',
      'preprocess functions' => array(
        'template_preprocess', 
        'template_preprocess_section',
        'alpha_preprocess',
        'alpha_preprocess_section',
      ),
      'process functions' => array(
        'template_process', 
        'template_process_section',
        'alpha_process',
        'alpha_process_section'
      ),
    ),
    'zone' => array(
      'template' => 'zone',
      'path' => $path . '/templates',
      'render element' => 'elements',
      'pattern' => 'zone__',
      'preprocess functions' => array(
        'template_preprocess', 
        'template_preprocess_zone',
        'alpha_preprocess',
        'alpha_preprocess_zone',
      ),
      'process functions' => array(
        'template_process', 
        'template_process_zone',
        'alpha_process',
        'alpha_process_zone'
      ),
    ),
  );
}

/**
 * Implements hook_preprocess().
 */
function alpha_preprocess(&$vars, $hook) {
  $vars['attributes_array']['class'] = $vars['classes_array'];
  
  alpha_invoke('preprocess', $hook, $vars);
}

/**
 * Implements hook_process().
 */
function alpha_process(&$vars, $hook) {
  if (!empty($vars['elements']['#grid']) || !empty($vars['elements']['#data']['wrapper_css'])) {
    if (!empty($vars['elements']['#grid'])) {
      foreach (array('prefix', 'suffix', 'push', 'pull') as $quality) {
        if (!empty($vars['elements']['#grid'][$quality])) {
          array_unshift($vars['attributes_array']['class'], $quality . '-' . $vars['elements']['#grid'][$quality]);
        }
      }

      array_unshift($vars['attributes_array']['class'], 'grid-' . $vars['elements']['#grid']['columns']);
    }
  
    if (!empty($vars['elements']['#data']['wrapper_css'])) {
      foreach (array_map('drupal_html_class', explode(' ', $vars['elements']['#data']['wrapper_css'])) as $class) {
        $vars['attributes_array']['class'][] = $class;
      }
    }
    
    $vars['attributes'] = $vars['attributes_array'] ? drupal_attributes($vars['attributes_array']) : '';
  }

  if (!empty($vars['elements']['#grid_container']) || !empty($vars['elements']['#data']['css'])) {
    if (!empty($vars['elements']['#data']['css'])) {
      foreach (array_map('drupal_html_class', explode(' ', $vars['elements']['#data']['css'])) as $class) {
        $vars['content_attributes_array']['class'][] = $class;
      }
    }

    if (!empty($vars['elements']['#grid_container'])) {
      $vars['content_attributes_array']['class'][] = 'container-' . $vars['elements']['#grid_container'];
    }

    $vars['content_attributes'] = $vars['content_attributes_array'] ? drupal_attributes($vars['content_attributes_array']) : '';
  }
  
  alpha_invoke('process', $hook, $vars);
}

/**
 * Implements hook_element_info_alter().
 */
function alpha_element_info_alter(&$elements) {
  if (variable_get('preprocess_css', FALSE) && (!defined('MAINTENANCE_MODE') || MAINTENANCE_MODE != 'update')) {
    array_unshift($elements['styles']['#pre_render'], 'alpha_css_preprocessor');
  }
}

/**
 * Implements hook_css_alter().
 */
function alpha_css_alter(&$css) {
  global $language;
  
  $theme = alpha_get_theme(); 
  
  if ($theme->settings['exclude']) {
    if ($exclude = array_filter($theme->settings['exclude'])) {
    
      if ($language->direction == LANGUAGE_LTR) {
        foreach ($exclude as $basename) {
          $rtl = str_replace('.css', '-rtl.css', $basename);
          $exclude[$rtl] = $rtl;
        }
      }
      
      foreach($css as $key => $item) {
        if (isset($exclude[$key])) {
          unset($css[$key]);
        }
      }
    }
  }
}

/**
 * Implements hook_page_alter().
 */
function alpha_page_alter(&$vars) {
  $theme = alpha_get_theme();
  $theme->settings['debug']['access'] = alpha_debug_access($GLOBALS['user'], $theme->settings['debug']['roles']);
  
  // If no module has taken care of the main content, add it to the page now.
  // This allows the site to still be usable even if no modules that
  // control page regions (for example, the Block module) are enabled.
  if (!drupal_static('system_main_content_added', FALSE)) {
    $vars['content']['system_main'] = drupal_set_page_content();
  }
  
  if (($theme->settings['debug']['access'] || $GLOBALS['user']->uid == 1) && ($theme->settings['debug']['grid'] || $theme->settings['debug']['block'])) {
    drupal_add_css(drupal_get_path('theme', 'alpha') . '/css/alpha-debug.css', array('group' => CSS_THEME, 'weight' => -5));   
    drupal_add_js(drupal_get_path('theme', 'alpha') . '/js/alpha-debug.js', array('group' => JS_THEME, 'weight' => -5));
    
    if ($theme->settings['responsive']) {        
      $vars['page_bottom']['alpha_resize_indicator'] = array(
        '#type' => 'markup',
        '#markup' => '<div class="alpha-resize-indicator"></div>',
      );
    }

    if ($theme->settings['debug']['grid']) {
      $vars['page_bottom']['alpha_grid_toggle'] = array(
        '#type' => 'markup',
        '#markup' => '<a class="alpha-grid-toggle" href="#"></a>',
      );
    }
    if ($theme->settings['debug']['block']) {
      $vars['page_bottom']['alpha_block_toggle'] = array(
        '#type' => 'markup',
        '#markup' => '<a class="alpha-block-toggle" href="#"></a>',
      );

      foreach ($theme->regions as $region => $item) {
        if ($item['enabled']) {  
          if (empty($vars[$region])) {
            $vars[$region]['#region'] = $region;
            $vars[$region]['#theme_wrappers'] = array('region');
          }

          if (isset($vars[$region]['#theme_wrappers']) && array_search('region', $vars[$region]['#theme_wrappers']) !== FALSE) {
            $vars[$region] = array('alpha_debug_' . $region => array(       
              '#type' => 'markup',
              '#markup' => '<div class="alpha-debug-block"><h2>' . $item['name'] . '</h2><p>' . t('This is a debugging block') . '</p></div>',
              '#weight' => -999,
            )) + $vars[$region];
          }
        }
      }
    }
  }
  
  if (!module_implements('alpha_page_structure_alter')) {
    alpha_alter('alpha_page_structure', $vars, $theme->theme);
  }
  else {
    drupal_alter('alpha_page_structure', $vars, $theme->theme);
  }
}

/**
 * Implements hook_alpha_page_alter().
 */
function alpha_alpha_page_structure_alter(&$vars) {
  $theme = alpha_get_theme();
  $temporary = array();
  
  foreach ($theme->regions as $region => $item) {
    if ($item['enabled'] && $theme->zones[$item['zone']]['enabled'] && ($item['force'] || !empty($vars[$region]))) {
      $temporary[$item['section']][$item['zone']][$region] = !empty($vars[$region]) ? $vars[$region] : array();
      $temporary[$item['section']][$item['zone']][$region]['#weight'] = (int) $item['weight'];
      $temporary[$item['section']][$item['zone']][$region]['#position'] = $item['position'];
      $temporary[$item['section']][$item['zone']][$region]['#data'] = $item;
      $temporary[$item['section']][$item['zone']][$region]['#grid'] = array(
        'prefix' => $item['prefix'],
        'suffix' => $item['suffix'],
        'push' => $item['push'],
        'pull' => $item['pull'],
        'columns' => $item['columns'],
      );
      
      $theme->regions[$region]['grid'] = &$temporary[$item['section']][$item['zone']][$region]['#grid'];
    
      if (empty($vars[$region])) {
        $temporary[$item['section']][$item['zone']][$region]['#region'] = $region;
        $temporary[$item['section']][$item['zone']][$region]['#theme_wrappers'] = array('region');
      }
    }
    else if (!empty($vars[$region])) {
      $vars['#excluded'][$region] = !empty($vars[$region]) ? $vars[$region] : array();
      $vars['#excluded'][$region]['#weight'] = (int) $item['weight'];
      $vars['#excluded'][$region]['#data'] = $item;
      $vars['#excluded'][$region]['#grid'] = array(
        'prefix' => $item['prefix'],
        'suffix' => $item['suffix'],
        'push' => $item['push'],
        'pull' => $item['pull'],
        'columns' => $item['columns'],
      );
    }
    
    unset($vars[$region]);
  }
  
  foreach ($theme->zones as $zone => $item) { 
    if ($item['enabled'] && ($item['force'] || !empty($temporary[$item['section']][$zone]))) {
      if (isset($item['primary']) && isset($temporary[$item['section']][$zone][$item['primary']])) {
        alpha_calculate_primary($temporary[$item['section']][$zone], $item['primary'], $item['columns']);
      }

      if ($item['order']) {
        alpha_calculate_position($temporary[$item['section']][$zone]);
      }
      
      $temporary[$item['section']][$zone]['#theme_wrappers'] = array('zone');      
      $temporary[$item['section']][$zone]['#zone'] = $zone;
      $temporary[$item['section']][$zone]['#weight'] = (int) $item['weight'];
      $temporary[$item['section']][$zone]['#data'] = $item;
      $temporary[$item['section']][$zone]['#grid_container'] = $item['columns'];
    }
  }

  foreach ($theme->sections as $section => $item) {
    if (isset($temporary[$section])) {   
      $temporary[$section]['#theme_wrappers'] = array('section');
      $temporary[$section]['#section'] = $section;
    }
  }
  
  $vars = array_merge($vars, $temporary);
}

/**
 * Implements hook_preprocess_section().
 */
function template_preprocess_section(&$vars) {
  $vars['theme_hook_suggestions'][] = 'section__' . $vars['elements']['#section'];  
  $vars['section'] = $vars['elements']['#section'];  
  $vars['content'] = $vars['elements']['#children'];
  $vars['attributes_array']['id'] = drupal_html_id('section-' . $vars['section']);
  $vars['classes_array'] = array('section', $vars['attributes_array']['id']);
}

/**
 * Implements hook_preprocess_zone().
 */
function template_preprocess_zone(&$vars) {
  $vars['theme_hook_suggestions'] = array('zone__' . $vars['elements']['#zone']);
  $vars['zone'] = $vars['elements']['#zone'];
  $vars['content'] = $vars['elements']['#children'];
  $vars['wrapper'] = $vars['elements']['#data']['wrapper'];
  $vars['columns'] = $vars['elements']['#data']['columns'];
  
  $vars['content_attributes_array']['id'] = drupal_html_id('zone-' . $vars['zone']);
  $vars['content_attributes_array']['class'] = array('zone', $vars['content_attributes_array']['id'], 'clearfix');
  
  if ($vars['wrapper']) {
    $vars['attributes_array']['id'] = drupal_html_id($vars['content_attributes_array']['id'] . '-wrapper');
    $vars['classes_array'] = array('zone-wrapper', $vars['attributes_array']['id'], 'clearfix');
  } 
  
  alpha_grid_include($vars['columns']);
}

/**
 * Implements hook_preprocess_block().
 */
function alpha_alpha_preprocess_block(&$vars) {
  $vars['content_attributes_array']['class'][] = 'content';
  $vars['content_attributes_array']['class'][] = 'clearfix';
  $vars['attributes_array']['id'] = $vars['block_html_id'];
  $vars['attributes_array']['class'][] = drupal_html_class('block-' . $vars['block']->delta);  
  $vars['attributes_array']['class'][] = $vars['block_html_id'];
}

/**
 * Implements hook_preprocess_html().
 */
function alpha_alpha_preprocess_html(&$vars) {
  $theme = alpha_get_theme();
  
  foreach (array('two-sidebars', 'one-sidebar sidebar-first', 'one-sidebar sidebar-second', 'no-sidebars') as $exclude) {
    if ($index = array_search($exclude, $vars['attributes_array']['class'])) {      
      unset($vars['attributes_array']['class'][$index]);
    }
  }
  
  // Add a CSS class based on the current page context.
  if (!drupal_is_front_page()) {
    $context = explode('/', drupal_get_path_alias());
    $context = reset($context);
    
    if (!empty($context)) {
      $vars['attributes_array']['class'][] = drupal_html_class('context-' . $context);
    }
  }
  
  if (($theme->settings['debug']['grid'] || $theme->settings['debug']['block']) && $theme->settings['debug']['access']) {
    if ($theme->settings['debug']['grid'] && $theme->settings['debug']['grid_active']) {
      $vars['attributes_array']['class'][] = 'alpha-grid-debug';
    }
    
    if ($theme->settings['debug']['block'] && $theme->settings['debug']['block_active']) {
      $vars['attributes_array']['class'][] = 'alpha-region-debug';
    }
  }
  
  if($theme->settings['responsive'] && $theme->settings['viewport']['enabled']) {
    $meta = array(
      '#tag' => 'meta',
      '#attributes' => array(
        'name' => 'viewport',
        'content' => 'width=device-width, initial-scale=' . $theme->settings['viewport']['initial'] . ', maximum-scale=' . $theme->settings['viewport']['max'] . ', minimum-scale=' . $theme->settings['viewport']['min'] . ', user-scalable=' . ($theme->settings['viewport']['user'] ? 'yes' : 'no'),
      ),
    );

    drupal_add_html_head($meta, 'alpha-viewport');
  }
  
  alpha_css_include();
  alpha_libraries_include();
}

/**
 * Implements hook_preprocess_page().
 */
function alpha_alpha_preprocess_page(&$vars) {
  $theme = alpha_get_theme();
  $theme->page = &$vars;
  
  $vars['feed_icons'] = $theme->settings['toggle']['feed_icons'] ? $vars['feed_icons'] : NULL;
  $vars['tabs'] = $theme->settings['toggle']['tabs'] ? $vars['tabs'] : NULL;
  $vars['action_links'] = $theme->settings['toggle']['action_links'] ? $vars['action_links'] : NULL;
  $vars['show_messages'] = $theme->settings['toggle']['messages'] ? $vars['show_messages'] : FALSE;  
  $vars['site_name_hidden'] = $theme->settings['hidden']['site_name'];
  $vars['site_slogan_hidden'] = $theme->settings['hidden']['site_slogan'];
  $vars['title_hidden'] = $theme->settings['hidden']['title'];   
  $vars['attributes_array']['id'] = 'page';
  $vars['attributes_array']['class'][] = 'clearfix';
}

/**
 * Implements hook_preprocess_region().
 */
function alpha_alpha_preprocess_region(&$vars) {
  $vars['attributes_array']['id'] = drupal_html_id('region-' . $vars['region']);
  $vars['content_attributes_array']['class'][] = 'region-inner';
  $vars['content_attributes_array']['class'][] = $vars['attributes_array']['id'] . '-inner';
}

/**
 * Implements hook_process_page().
 */
function alpha_alpha_process_page(&$vars) {
  $theme = alpha_get_theme();
  
  $vars['title'] = $theme->settings['toggle']['page_title'] ? $vars['title'] : NULL;
  $vars['breadcrumb'] = $theme->settings['toggle']['breadcrumb'] ? $vars['breadcrumb'] : NULL;
}
