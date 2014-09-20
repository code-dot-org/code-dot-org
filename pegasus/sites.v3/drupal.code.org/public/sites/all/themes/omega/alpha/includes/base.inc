<?php

/**
 * @file
 * Container class for theme configuration.
 */

class alpha_theme_container {
  var $theme;
  var $settings;
  var $css;
  var $grid;
  var $grids;
  var $libraries;
  var $sections;
  var $zones;
  var $regions;
  var $page;
  
  /**
   * @todo
   */
  function __construct($theme, $delta = NULL) {
    $this->theme = $theme;
    $this->delta = $delta;
    
    if ($cache = alpha_cache_get($theme, $delta)) {
      foreach ($cache->data as $key => $item) {
        $this->$key = $item;
      }
    }
    
    foreach ($this->cacheable() as $item => $required) {
      if ($required && !isset($this->$item)) {
        $this->init();
        
        alpha_alter('alpha_pre_cache', $this, $theme, $delta);
        alpha_cache_set($this);
        
        return;
      }
    }
    
    alpha_alter('alpha', $this, $theme, $delta);
  }
  
  /**
   * @todo
   */
  function init() {
    $this->settings();
    $this->sections();
    $this->zones();    
    $this->regions();
    $this->grids();
    $this->grid();
    $this->css();
    $this->libraries();
  }
  
  /**
   * @todo
   */
  function settings() {
    if (!isset($this->settings)) {      
      $this->settings = array(
        'grid' => alpha_theme_get_setting('alpha_grid', 'default', $this->theme),
        'css' => alpha_theme_get_setting('alpha_css', array(), $this->theme),
        'libraries' => alpha_theme_get_setting('alpha_libraries', array(), $this->theme),
        'exclude' => alpha_theme_get_setting('alpha_exclude', array(), $this->theme),      
        'responsive' => alpha_theme_get_setting('alpha_responsive', FALSE, $this->theme),
        'toggle' => array(),
        'hidden' => array(),
        'viewport' => array(
          'enabled' => alpha_theme_get_setting('alpha_viewport', FALSE, $this->theme),
          'initial' => alpha_theme_get_setting('alpha_viewport_initial_scale', 1, $this->theme),
          'min' => alpha_theme_get_setting('alpha_viewport_min_scale', 1, $this->theme),
          'max' => alpha_theme_get_setting('alpha_viewport_max_scale', 1, $this->theme),
          'user' => alpha_theme_get_setting('alpha_viewport_user_scaleable', TRUE, $this->theme),
        ),
        'debug' => array(
          'block' => alpha_theme_get_setting('alpha_debug_block_toggle', FALSE, $this->theme),
          'block_active' => alpha_theme_get_setting('alpha_debug_block_active', FALSE, $this->theme),
          'grid' => alpha_theme_get_setting('alpha_debug_grid_toggle', FALSE, $this->theme),
          'grid_active' => alpha_theme_get_setting('alpha_debug_grid_active', FALSE, $this->theme),
          'roles' => array_keys(array_filter(alpha_theme_get_setting('alpha_debug_grid_roles', array(), $this->theme))),
        ),
      );

      foreach (alpha_toggle() as $item => $title) {
        $this->settings['toggle'][$item] = alpha_theme_get_setting('alpha_toggle_' . $item, TRUE, $this->theme);
      }

      foreach (alpha_visibility() as $item => $title) {
        $this->settings['hidden'][$item] = alpha_theme_get_setting('alpha_hidden_' . $item, FALSE, $this->theme);
      }

      alpha_alter('alpha_settings', $this->settings, $this->theme);
    }
    
    return $this->settings;
  }
  
  /**
   * @todo
   */
  function grids() {
    if (!isset($this->grids)) {
      $this->settings();
      $this->grids = alpha_retrieve_grids($this->theme);
    }
    
    return $this->grids;
  }
  
  /**
   * @todo
   */
  function grid() {
    if (!isset($this->grid)) {      
      $this->grids();  
      
      if (isset($this->grids[$this->settings['grid']])) {
        $this->grid = alpha_grid_css($this->theme, $this->grids[$this->settings['grid']], $this->settings['responsive']);
      }
      else {
        $this->grid = array();
      }
    }

    return $this->grid;
  }
  
  /**
   * @todo
   */
  function css() {
    if (!isset($this->css)) {
      $this->css = alpha_retrieve_css($this->theme);
    }
    
    return $this->css;
  }
  
  /**
   * @todo
   */
  function libraries() {
    if (!isset($this->libraries)) {
      $this->libraries = alpha_retrieve_libraries($this->theme);
    }
    
    return $this->libraries;
  }
  
  /**
   * @todo
   */
  function sections() {
    if (!isset($this->sections)) {
      $this->sections = array(
        'header' => t('Header'),
        'content' => t('Content'),
        'footer' => t('Footer'),
      );
    }
    
    return $this->sections;
  }
  
  /**
   * @todo
   */
  function zones() {
    if (!isset($this->zones)) {
      $this->sections();
      $this->zones = array();

      if ($zones = alpha_info('zones', $this->theme)) {
        foreach ($zones as $zone => $title) {
          $section = alpha_zone_get_setting('section', $zone, NULL, $this->theme);
          $section = isset($this->sections[$section]) ? $section : NULL;
          
          $this->zones[$zone] = array(
            'zone' => $zone,
            'name' => $title,
            'enabled' => isset($this->sections[$section]),
            'force' => alpha_zone_get_setting('force', $zone, FALSE, $this->theme),
            'columns' => alpha_zone_get_setting('columns', $zone, 0, $this->theme),
            'section' => $section,
            'weight' => alpha_zone_get_setting('weight', $zone, 0, $this->theme),
            'wrapper' => alpha_zone_get_setting('wrapper', $zone, FALSE, $this->theme),
            'wrapper_css' => alpha_zone_get_setting('wrapper_css', $zone, NULL, $this->theme),
            'primary' => alpha_zone_get_setting('primary', $zone, NULL, $this->theme),
            'order' => alpha_zone_get_setting('order', $zone, FALSE, $this->theme),
            'css' => alpha_zone_get_setting('css', $zone, NULL, $this->theme),
          );
        }
      }

      uasort($this->zones, 'drupal_sort_weight');    
      alpha_alter('alpha_zones', $this->zones, $this->theme);
    }

    return $this->zones;
  }
  
  /**
   * @todo
   */
  function regions() {
    if (!isset($this->regions)) {
      $this->zones();
      $this->sections();
      $this->regions = array();      
      $exclude = alpha_regions_exclude();

      foreach (system_region_list($this->theme) as $region => $title) {
        if (!in_array($region, $exclude)) {
          $zone = alpha_region_get_setting('zone', $region, NULL, $this->theme);
          $prefix = alpha_region_get_setting('prefix', $region, 0, $this->theme);
          $columns = alpha_region_get_setting('columns', $region, 1, $this->theme);
          $suffix = alpha_region_get_setting('suffix', $region, 0, $this->theme);
          
          $zone = isset($zone) && isset($this->zones[$zone]) ? $zone : NULL;
          $section = isset($zone) && isset($this->zones[$zone]['section']) ? $this->zones[$zone]['section'] : NULL;
          
          $this->regions[$region] = array(
            'region' => $region,
            'name' => $title,
            'zone' => $zone,
            'section' => $section,
            'enabled' => isset($zone),
            'force' => alpha_region_get_setting('force', $region, FALSE, $this->theme),
            'prefix' => $prefix,
            'columns' => $columns,
            'suffix' => $suffix,
            'width' => $prefix + $columns + $suffix,
            'push' => 0,
            'pull' => 0,
            'wrapper_css' => alpha_region_get_setting('css', $region, NULL, $this->theme),
            'weight' => alpha_region_get_setting('weight', $region, 0, $this->theme),
            'position' => alpha_region_get_setting('position', $region, 0, $this->theme),
            'primary' => isset($zone) && $this->zones[$zone]['primary'] == $region,
          );
        }
      }

      uasort($this->regions, 'drupal_sort_weight');
      alpha_alter('alpha_regions', $this->regions, $this->theme);
    }

    return $this->regions;
  }
  
  /**
   * @todo
   */
  function cacheable() {
    $cacheable = array_fill_keys(array('settings', 'libraries', 'css', 'grids', 'grid', 'regions', 'zones', 'sections'), TRUE);
    
    alpha_alter('alpha_cacheable', $cacheable, $this->theme);
    
    return $cacheable;
  }
}
