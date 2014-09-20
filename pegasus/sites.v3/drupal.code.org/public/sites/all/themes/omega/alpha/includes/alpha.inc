<?php

/**
 * @file
 * Helper functions for the Alpha base theme.
 */

/**
 * A wrapper function for theme_get_settings().
 * 
 * @param $name
 *   The name of the setting that you want to retrieve. 
 * @param $default (optional)
 *   The name (key) of the theme that you want to fetch the
 *   setting for. Defaults to NULL.   
 * @param $theme (optional)
 *   The key (machin-readable name) of a theme. Defaults to the key of the
 *   current theme if not defined.
 *   
 * @see 
 *   theme_get_setting().
 */
function alpha_theme_get_setting($name, $default = NULL, $theme = NULL) {
  $setting = theme_get_setting($name, $theme);
  
  return isset($setting) ? $setting : $default; 
}

/**
 * A helper function for retrieving zone settings.
 * 
 * @param $name
 *   The name of the setting that you want to retrieve. 
 * @param $zone
 *   The zone that you want to fetch the setting for. 
 * @param $default (optional)
 *   The name (key) of the theme that you want to fetch the
 *   setting for. Defaults to NULL.   
 * @param $theme (optional)
 *   The key (machin-readable name) of a theme. Defaults to the key of the
 *   current theme if not defined.
 *   
 * @see 
 *   alpha_theme_get_setting().
 * 
 * @see
 *   theme_get_setting().
 */
function alpha_zone_get_setting($name, $zone, $default = NULL, $theme = NULL) {
  $setting = theme_get_setting('alpha_zone_' . $zone . '_' . $name, $theme);
  
  return isset($setting) ? $setting : $default;
}

/**
 * A helper function for retrieving region settings.
 * 
 * @param $name
 *    The name of the setting that you want to retrieve. 
 * @param $region
 *    The region that you want to fetch the setting for. 
 * @param $default (optional)
 *   The name (key) of the theme that you want to fetch the
 *   setting for. Defaults to NULL.   
 * @param $theme (optional)
 *   The key (machin-readable name) of a theme. Defaults to the key of the
 *   current theme if not defined.
 *   
 * @see 
 *   alpha_theme_get_setting().
 * 
 * @see
 *   theme_get_setting().
 */
function alpha_region_get_setting($name, $region, $default = NULL, $theme = NULL) {
  $setting = theme_get_setting('alpha_region_' . $region . '_' . $name, $theme);
  
  return isset($setting) ? $setting : $default;
}

/**
 * Invokes a preprocess or process hook in all base themes aswell 
 * as the subtheme (in that order) by including the corresponding 
 * .inc file and calling the associated function.
 * 
 * @param $type
 *   The type of the hook. Can be preprocess or process. 
 * @param $hook
 *   The name of the hook. 
 * @param &$vars
 *   An array of variables belonging to the (pre)process hook.
 *   Handed by reference.
 */
function alpha_invoke($type, $hook, &$vars) {
  $theme = alpha_get_theme();
  
  // If one of the themes in the theme trail implements this hook
  // include the corresponding .inc file and call the associated function.
  foreach (alpha_theme_trail($theme->theme) as $key => $name) {
    $function = $key . '_alpha_' . $type . '_' . $hook;
    
    if (!function_exists($function)) {
      $file = drupal_get_path('theme', $key) . '/' . $type . '/' . $type . '-' . str_replace('_', '-', $hook) . '.inc';
      
      if (is_file($file)) {
        include $file;
      }
    }
    
    if (function_exists($function)) {
      $function($vars);
    }
  }
}

/**
 * This function "fixes" drupal_alter so it also works in the theme-settings and anywhere else 
 * where you want to be 100% certain that drupal_alter uses the proper global $theme.
 * 
 * The problem with drupal_alter is, that it always relies on the global $theme while
 * the theme-settings page relies (and "overrides") the global $theme_key variable while
 * building its form.
 * 
 * @param $type
 * @param $data
 * @param $context1
 * @param $context2
 * 
 * @see
 *   See drupal_alter() for more information about how this works.
 */
function alpha_alter($type, &$data, &$context1 = NULL, &$context2 = NULL) {
  global $theme, $base_theme_info;

  if ($theme != $context1) {
    $themes = list_themes();
    
    if (!empty($themes[$context1])) {
      $theme_original = $theme;
      $base_theme_info_original = $base_theme_info;
      
      foreach (alpha_theme_trail($context1) as $key => $title) {
        if (isset($themes[$key])) {
          $base_theme_info[$key] = $themes[$key];
        }
      }
      
      $functions = &drupal_static('drupal_alter');
      
      if (!empty($base_theme_info)) {
        foreach ($base_theme_info as $item) {
          if (is_file(drupal_get_path('theme', $item->name) . '/template.php')) {
            include_once drupal_get_path('theme', $item->name) . '/template.php';
          }
        }
      }
      
      array_pop($base_theme_info);
      
      $theme = $context1;
            
      drupal_alter($type, $data, $context1, $context2);      
      
      $theme = $theme_original;
      $base_theme_info = $base_theme_info_original;
      
      unset($functions[$type]);
    }
  }
  else {
    drupal_alter($type, $data, $context1, $context2);
  }
}

/**
 * Builds the full theme trail (deepest base theme first, subtheme last)
 * for a theme.
 * 
 * @param $theme
 *   The key (machin-readable name) of a theme.
 *
 * @return
 *   An array of all themes in the trail, keyed by theme key.
 */
function alpha_theme_trail($theme) {
  $static = &drupal_static(__FUNCTION__);
  
  if (!isset($static)) {
    $themes = list_themes();
    
    if (isset($themes[$theme]->info['base theme'])) {
      foreach (system_find_base_themes($themes, $theme) as $base => $name) {
        if ($name && isset($themes[$base])) {
          $static[$theme][$base] = $themes[$base]->info['name'];
        }
      }
    }

    // Add our current subtheme ($key) to that array.
    if (isset($themes[$theme])) {
      $static[$theme][$theme] = $themes[$theme]->info['name'];
    }
  }

  if (isset($static[$theme])) {
    return $static[$theme];
  }
}

/**
 * Returns the theme container object for the current theme.
 *
 * @return
 *   An object representing the current theme.
 */
function alpha_get_theme() {
  $container = &drupal_static(__FUNCTION__);
  
  $key = $theme = $GLOBALS['theme_key'];
  $delta = NULL;
  
  if (module_exists('delta') && $delta = delta_get_current($theme)) {
    $key .= ':' . $delta;
  }
  
  if (!isset($container[$key])) {  
    foreach (array_keys(alpha_theme_trail($theme)) as $item) {
      if (class_exists($item . '_theme_container')) {
        $class = $item . '_theme_container';
      }
    }
    
    if (isset($class)) {
      $container[$key] = new $class($theme, $delta);
    }
  }
  
  return $container[$key];
}

/**
 * Includes all activated libraries for the current theme.
 */
function alpha_libraries_include() {
  $theme = alpha_get_theme();
  
  foreach (array_filter($theme->settings['libraries']) as $item => $status) {
    if (alpha_library_active($item)) {
      if (!empty($theme->libraries[$item]['js'])) {
        foreach ($theme->libraries[$item]['js'] as $include) {
          drupal_add_js($include['path'], $include['options']);
        }
      }

      if (!empty($theme->libraries[$item]['css'])) {
        foreach ($theme->libraries[$item]['css'] as $include) {
          drupal_add_css($include['path'], $include['options']);
        }
      }
    }
  }
}

/**
 * Includes all custom CSS files for the current theme.
 */
function alpha_css_include() {
  $theme = alpha_get_theme();
  
  foreach (array_filter($theme->settings['css']) as $item => $status) {
    if (alpha_css_active($item)) {
      drupal_add_css($theme->css[$item]['path'], $theme->css[$item]['options']);
    }
  }
}

/**
 * Checks wether a library is active in the current theme.
 *
 * @param $library
 *   The name of a library.
 *
 * @return
 *   Boolean TRUE or FALSE.
 */
function alpha_library_active($library) {
  $theme = alpha_get_theme();
  
  if (isset($theme->libraries[$library], $theme->settings['libraries'][$library]) && $theme->settings['libraries'][$library] === $library) {
    return TRUE;
  }
  
  return FALSE;
}

/**
 * Checks wether a custom CSS file is active in the current theme.
 *
 * @param $css
 *   The filename of a CSS file.
 *
 * @return
 *   Boolean TRUE or FALSE.
 */
function alpha_css_active($css) {
  $theme = alpha_get_theme();
  
  if (isset($theme->css[$css], $theme->settings['css'][$css]) && $theme->settings['css'][$css] === $css) {
    return TRUE;
  }

  return FALSE;
}

/**
 * @deprecated
 */
function alpha_regions() {
  return alpha_get_theme()->regions();
}

/**
 * @deprecated
 */
function alpha_zones() {
  return alpha_get_theme()->zones();
}

/**
 * @deprecated
 */
function alpha_sections() {
  return alpha_get_theme()->sections();
}


/**
 * @deprecated
 */
function alpha_settings() {
  return alpha_get_theme()->settings();
}

/**
 * Includes all active layouts for a specific column count of the grid in
 * charge for the current theme and also adds the corresponding grid debugging
 * CSS if debugging is enabled.
 *
 * @param $columns
 *   An integer value that declares the column layout that the grid CSS should
 *   be generated for.
 */
function alpha_grid_include($columns) {
  $processed = &drupal_static(__FUNCTION__);
  
  if (empty($processed[$columns])) {
    $processed[$columns] = TRUE;
    $theme = alpha_get_theme();
    
    if (!empty($theme->grid)) {
      foreach ($theme->grid as &$item) {
        if (empty($item['processed']) && (empty($item['columns']) || $item['columns'] == $columns)) {
          $item['processed'] = TRUE;

          drupal_add_css($item['item'], $item['options']);
        }
      }
    }
    
    if ($theme->settings['debug']['access'] && $theme->settings['debug']['grid']) {
      if (isset($theme->grids[$theme->settings['grid']])) {
        alpha_grid_debug($theme->grids[$theme->settings['grid']], $theme->settings['responsive'], $columns);
      }
    }
  }
}

/**
 * Generates and includes debugging information for a grid.
 *
 * @param $grid
 *   A grid info array.
 * @param $responsive
 *   A boolean indicating wether the grid debug CSS should be included in
 *   responsive or non-responsive mode.
 * @param $columns
 *   An integer value that declares the column layout that the grid debug
 *   CSS should be included for.
 */
function alpha_grid_debug($grid, $responsive, $columns) {
  if (isset($grid['columns'][$columns])) {
    if ($responsive) {      
      $browsers = array('IE' => 'gte IE 9', '!IE' => TRUE);
      $layouts = array_keys($grid['layouts']);
    }
    else {
      $browsers = array('IE' => TRUE, '!IE' => TRUE);
      $layouts = isset($grid['layouts'][$grid['primary']]) ? array($grid['primary']) : array();
    }

    foreach ($layouts as $layout) {
      if ($grid['layouts'][$layout]['enabled'] || !$responsive) {
        $media = $responsive ? $grid['layouts'][$layout]['media'] : 'all';
        $weight = $grid['layouts'][$layout]['weight'];
        $sanitized = $grid['layouts'][$layout]['sanitized'];
        $file = $grid['path'] . '/' . $sanitized . '/' . $grid['sanitized'] . '-' . $sanitized . '-' . $columns . '.png';
        $overlay = '.alpha-grid-debug .container-' . $columns . ' { background-image: ' . (is_file($file) ? 'url(' . file_create_url($file) . ')' : 'none') . '; }';

        if ($responsive && $layout == $grid['primary']) {
          drupal_add_css($overlay, array(
            'type' => 'inline',
            'media' => 'all', 
            'browsers' => array('IE' => '(lt IE 9)&(!IEMobile)', '!IE' => FALSE), 
            'group' => -2000,
            'weight' => $weight,
          ));
        }

        drupal_add_css($overlay, array(
          'type' => 'inline',          
          'browsers' => $browsers,
          'group' => -1000,
          'weight' => $weight,
          'media' => $media,
        ));
      }
    }
  }
}

/**
 * Builds an array of grid CSS information.
 * 
 * @param $theme
 *   The key (machin-readable name) of a theme.
 * @param $grid
 *   A grid info array.
 * @param $responsive
 *   A boolean indicating wether the grid CSS should be generated in
 *   responsive or non-responsive mode.
 * 
 * @return
 *   An array of CSS files related to a grid.
 */
function alpha_grid_css($theme, $grid, $responsive) {
  $columns = array_keys($grid['columns']);
  
  if ($responsive) {      
    $browsers = array('IE' => 'gte IE 9', '!IE' => TRUE);
    $layouts = array_keys($grid['layouts']);
  }
  else {
    $browsers = array('IE' => TRUE, '!IE' => TRUE);
    $layouts = isset($grid['layouts'][$grid['primary']]) ? array($grid['primary']) : array();
  }
  
  $output = array();
  
  if (!empty($layouts)) {
    $trail = array_keys(alpha_theme_trail($theme));
    
    foreach ($layouts as $layout) {
      $enabled = $grid['layouts'][$layout]['enabled'];
      
      if (!$responsive || $enabled) {
        $media = $responsive ? $grid['layouts'][$layout]['media'] : 'all';
        $weight = $grid['layouts'][$layout]['weight'];
        $sanitized = $grid['layouts'][$layout]['sanitized'];        
        $attached = array();

        foreach ($trail as $item) {
          $path = drupal_get_path('theme', $item) . '/css';
          $file = str_replace('_', '-', $item) . '-' . $grid['sanitized'];

          if ($item = alpha_find_stylesheet($path, $file)) {
            $attached[] = $item;
          }

          if ($item = alpha_find_stylesheet($path, $file . '-' . $sanitized)) {
            $attached[] = $item;
          }
        }

        foreach ($attached as $item) {
          $basename = $layout . '::' . $item;

          $output[$basename]['processed'] = FALSE;
          $output[$basename]['item'] = $basename;
          $output[$basename]['options'] = array(
            'group' => 2000,
            'weight' => $weight,                
            'data' => $item, 
            'basename' => $basename,                
            'media' => $media,
            'browsers' => $browsers,
            'preprocess_media' => TRUE,
          );

          if ($responsive && $grid['primary'] == $layout) {
            $basename = 'ie::' . $basename;

            $output[$basename]['processed'] = FALSE;
            $output[$basename]['item'] = $basename;
            $output[$basename]['options'] = array(
              'group' => 1000,
              'weight' => $weight,
              'data' => $item, 
              'basename' => $basename,
              'browsers' => array('IE' => '(lt IE 9)&(!IEMobile)', '!IE' => FALSE),
            );
          }
        }

        $path = $grid['path'] . '/' . $layout . '/' . $grid['sanitized'] . '-' . $sanitized;

        foreach ($columns as $count) {
          $file = $path . '-' . $count . '.css';

          $output[$file]['processed'] = FALSE;
          $output[$file]['columns'] = $count;
          $output[$file]['item'] = $file;
          $output[$file]['options'] = array(
            'group' => 2000,
            'weight' => $weight,
            'media' => $media,
            'browsers' => $browsers,          
            'preprocess_media' => TRUE,
          );

          if ($responsive && $grid['primary'] == $layout) {                
            $basename = 'ie::' . $layout . '::' . $path . '-' . $count . '.css';

            $output[$basename]['processed'] = FALSE;
            $output[$basename]['columns'] = $count;
            $output[$basename]['item'] = $basename;
            $output[$basename]['options'] = array(
              'group' => 1000,
              'weight' => $weight,
              'data' => $file,
              'basename' => $basename,
              'browsers' => array('IE' => '(lt IE 9)&(!IEMobile)', '!IE' => FALSE),                
            );
          }
        }
      }
    }
  }
  
  return $output;
}


/**
 * Preprocesses CSS files so that CSS files that have 'preprocess_media'
 * set to TRUE are set to media="all" while having their former media query
 * added to the file content.
 *
 * @param $elements
 *   An array of CSS files as in drupal_pre_render_styles().
 *
 * @return
 *   An array of preprocessed CSS files.
 *
 * @see
 *   drupal_pre_render_styles().
 */
function alpha_css_preprocessor($elements) {
  $theme = alpha_get_theme();

  if ($theme->settings['responsive']) {
    $standard = array('all', 'screen', 'print', 'handheld', 'projection',
      'tty', 'tv', 'aural', 'braille', 'embossed');

    foreach ($elements['#items'] as &$item) {
      if (!empty($item['preprocess_media']) && $item['type'] == 'file' && $item['preprocess'] && !in_array($item['media'], $standard)) {
        $item['data'] = alpha_css_cache_media_query($item);
        $item['media'] = 'all';
      }
    }
  }

  return $elements;
}

/**
 * @todo
 */
function alpha_css_cache_media_query($item) {
  $map = variable_get('drupal_css_cache_files', array());
  $key = hash('sha256', serialize($item));
  $uri = isset($map[$key]) ? $map[$key] : NULL;

  if (empty($uri) || !file_exists($uri)) {
    // Build the base URL of this CSS file: start with the full URL.
    $base = file_create_url($item['data']);
    $base = substr($base, 0, strrpos($base, '/'));

    if (substr($base, 0, strlen($GLOBALS['base_root'])) == $GLOBALS['base_root']) {
      $base = substr($base, strlen($GLOBALS['base_root']));
    }

    _drupal_build_css_path(NULL, $base . '/');

    $data = drupal_load_stylesheet($item['data'], TRUE);

    // Anchor all paths in the CSS with its base URL, ignoring external and absolute paths.
    $data = preg_replace_callback('/url\(\s*[\'"]?(?![a-z]+:|\/+)([^\'")]+)[\'"]?\s*\)/i', '_drupal_build_css_path', $data);
    $data = '@media ' . $item['media'] . '{' . $data . '}';

    // Create the css/ within the files folder.
    $directory = 'public://css';
    $uri = $directory . '/css_' . drupal_hash_base64($data) . '.css';

    // Create the CSS file.
    file_prepare_directory($directory, FILE_CREATE_DIRECTORY);
    if (!file_exists($uri) && !file_unmanaged_save_data($data, $uri, FILE_EXISTS_REPLACE)) {
      return FALSE;
    }

    // If CSS gzip compression is enabled, clean URLs are enabled (which means
    // that rewrite rules are working) and the zlib extension is available then
    // create a gzipped version of this file. This file is served conditionally
    // to browsers that accept gzip using .htaccess rules.
    if (variable_get('css_gzip_compression', TRUE) && variable_get('clean_url', 0) && extension_loaded('zlib')) {
      if (!file_exists($uri . '.gz') && !file_unmanaged_save_data(gzencode($data, 9, FORCE_GZIP), $uri . '.gz', FILE_EXISTS_REPLACE)) {
        return FALSE;
      }
    }

    // Save the updated map.
    $map[$key] = $uri;

    variable_set('drupal_css_cache_files', $map);
  }

  return $uri;
}

/**
 * Clears the cache for the real theme or a delta template.
 *
 * @param $theme
 *   The key (machin-readable name) of a theme.
 * @param $delta (optional)
 *   The machine-readable name of a delta template.
 */
function alpha_cache_clear($theme, $delta = NULL) {
  if (!isset($delta)) {
    cache_clear_all('alpha:' . $theme, 'cache');
  }
  else {
    cache_clear_all('alpha:' . $theme . ':' . $delta, 'cache');
  }
}

/**
 * Caches theme real theme or a delta template.
 *
 * @param $theme
 *   The key (machin-readable name) of a theme.
 *
 * @return
 *   The return value of cache_set().
 *
 * @see
 *   cache_set().
 */
function alpha_cache_set($theme) {
  $cache = new stdClass();
  
  foreach (array_keys($theme->cacheable()) as $item) {
    if (isset($theme->$item)) {
      $cache->$item = $theme->$item;
    }
  }
  
  if (isset($theme->delta)) {
    return cache_set('alpha:' . $theme->theme . ':' . $theme->delta, $cache);
  }
  else {
    return cache_set('alpha:' . $theme->theme, $cache);
  }
}

/**
 * Retrieves the cached parts of a theme container.
 *
 * @param $theme
 *   The key (machin-readable name) of a theme.
 * @param $delta (optional)
 *   The machine-readable name of a delta template.
 *
 * @return
 *   A cache object or nothing if no cache entry exists.
 */
function alpha_cache_get($theme, $delta = NULL) {
  if (isset($delta)) {
    return cache_get('alpha:' . $theme . ':' . $delta);
  }
  else {
    return cache_get('alpha:' . $theme);
  }
}

/**
 * Retrieve a list of CSS files that a theme may exclude via alpha_css_alter.
 *
 * @param $theme
 *   The key (machin-readable name) of a theme.
 * 
 * @return
 *   An array of module and theme defined CSS files.
 */
function alpha_retrieve_excludes($theme) {
  $themes = list_themes();  
  $styles = array();
  
  foreach (system_rebuild_module_data() as $module => $data) {
    if ($data->status && !empty($data->info['stylesheets'])) {
      foreach ($data->info['stylesheets'] as $media => $content) {        
        foreach ($content as $file) {          
          $styles[$file] = array(
            'type' => 'module',
            'source' => $module,
            'name' => $data->info['name'],
            'file' => $file,
            'media' => $media,
            'description' => NULL,
          );
        }
      }
    }
  }
  
  foreach (alpha_info_trail('stylesheets', $theme) as $item => $data) {
    foreach ($data as $media => $content) {
      foreach ($content as $file) {
        $styles[$file] = array(
          'type' => 'theme',
          'source' => $item,
          'name' => $themes[$item]->info['name'],
          'file' => $file,
          'media' => $media,
          'description' => NULL,
        );
      }
    }
  }
  
  foreach (alpha_info_trail('exclude', $theme) as $item => $data) {
    foreach ($data as $file => $description) {
      $styles[$file] = array(
        'type' => 'exclude',
        'source' => $item,
        'name' => $themes[$item]->info['name'],
        'file' => $file,
        'media' => NULL,
        'description' => $description,
      );
    }
  }
  
  return $styles;
}

/**
 * Retrieves an array of available grids for a theme.
 *
 * @param $theme
 *   The key (machin-readable name) of a theme.
 *
 * @return
 *   An array containing all grid related information.
 */
function alpha_retrieve_grids($theme) {
  $output = array();

  foreach (alpha_info_trail('grids', $theme) as $key => $data) {
    foreach ($data as $grid => $info) {
      $output[$grid] = array(
        'theme' => $key,
        'grid' => $grid,
        'name' => $info['name'],
        'sanitized' => str_replace('_', '-', $grid),
        'layouts' => $info['layouts'],
        'columns' => $info['columns'],        
        'path' => drupal_get_path('theme', $key) . '/css/grid/' . $grid,
      );

      $output[$grid]['primary'] = alpha_theme_get_setting('alpha_primary_' . $grid, key($info['layouts']), $theme);

      foreach ($output[$grid]['layouts'] as $layout => $title) {
        $output[$grid]['layouts'][$layout] = array(
          'layout' => $layout,
          'name' => $title,
          'sanitized' => str_replace('_', '-', $layout),
          'enabled' => alpha_theme_get_setting('alpha_layouts_' . $grid . '_' . $layout . '_responsive', FALSE, $theme),
          'media' => alpha_theme_get_setting('alpha_layouts_' . $grid . '_' . $layout . '_media', 'all', $theme),
          'weight' => alpha_theme_get_setting('alpha_layouts_' . $grid . '_' . $layout . '_weight', 0, $theme),
        );
      }

      uasort($output[$grid]['layouts'], 'alpha_sort_layouts');
    }
  }
    
  alpha_alter('alpha_grids', $output, $theme);
  
  return $output;
}

/**
 * Retrieves an array of available custom CSS files for a theme.
 *
 * @param $theme
 *   The key (machin-readable name) of a theme.
 *
 * @return
 *   An array of available CSS files.
 */
function alpha_retrieve_css($theme) {
  $output = array();
  
  foreach (alpha_info_trail('css', $theme) as $key => $data) {
    foreach ($data as $name => $info) {
      $output[$name] = array(
        'theme' => $key,
        'file' => $name,
        'path' => drupal_get_path('theme', $key) . '/' . (isset($info['path']) ? $info['path'] : 'css') . '/' . $name,
        'options' => (isset($info['options']) ? $info['options'] : array()) + array('group' => CSS_THEME),
        'name' => $info['name'],
        'description' => isset($info['description']) ? $info['description'] : '',
      );
    }
  }

  alpha_alter('alpha_css', $output, $theme);
  
  return $output;
}

/**
 * Retrieves an array of available libraries for a theme.
 *
 * @param $theme
 *   The key (machin-readable name) of a theme.
 *
 * @return
 *   An array of available libraries.
 */
function alpha_retrieve_libraries($theme) {
  $output = array();

  foreach (alpha_info_trail('libraries', $theme) as $key => $data) {
    foreach ($data as $name => $info) {
      $output[$name] = array(
        'name' => $info['name'],
        'description' => isset($info['info']['description']) ? $info['info']['description'] : '',
      );

      foreach (array('css', 'js') as $type) {
        if (!empty($info[$type])) {
          foreach ($info[$type] as $index => $item) {
            $output[$name][$type][$index] = array(
              'file' => $item['file'],
              'path' => drupal_get_path('theme', $key) . '/' . (isset($item['path']) ? $item['path'] : $type) . '/' . $item['file'],
              'options' => (isset($item['options']) ? $item['options'] : array()) + array('group' => ($type == 'css' ? CSS_THEME : JS_THEME)),
            );
          }
        }
      }
    }
  }
    
  alpha_alter('alpha_libraries', $output, $theme);
  
  return $output;
}

/**
 * Recalculates the width of a primary element so that it fills the entire
 * container. This is useful in cases where you want to have a primary element
 * that consumes the empty space of one or more other elements that have been
 * removed.
 *
 * @param &$item
 *   A list of grid elements.
 * @param $primary
 *   The name of the primary element.
 * @param $container
 *   The column count (width) of the container.
 */
function alpha_calculate_primary(&$items, $primary, $container) {
  if (!empty($items)) {
    $items[$primary]['#grid']['columns'] = $container - $items[$primary]['#grid']['prefix'] - $items[$primary]['#grid']['suffix'];

    foreach (element_children($items) as $item) {
      if ($item != $primary) {
        $items[$primary]['#grid']['columns'] -= $items[$item]['#grid']['columns'] + $items[$item]['#grid']['prefix'] + $items[$item]['#grid']['suffix'];
      }
    }
  }
}

/**
 * Calculates the position of a element in a grid container by using the #weight
 * as the DOM position and then calculation the required pull and push CSS
 * classes to move the affected elements to their proper #position value.
 *
 * @param &$items
 *   An array of grid elements.
 */
function alpha_calculate_position(&$items) {
  if (!empty($items)) {
    $children = element_children($items, TRUE);
    
    foreach ($children as $a => $item) {
      foreach ($children as $b => $inner) {
        if ($item != $inner) {
          if ($a >= $b && $items[$item]['#position'] < $items[$inner]['#position']) {
            $items[$item]['#grid']['pull'] += $items[$inner]['#grid']['columns'] + $items[$inner]['#grid']['prefix'] + $items[$inner]['#grid']['suffix'];
          }
          else if ($a <= $b && $items[$item]['#position'] > $items[$inner]['#position']) {
            $items[$item]['#grid']['push'] += $items[$inner]['#grid']['columns'] + $items[$inner]['#grid']['prefix'] + $items[$inner]['#grid']['suffix'];
          }
        }
      }

      if ($items[$item]['#grid']['pull'] > $items[$item]['#grid']['push']) {
        $items[$item]['#grid']['pull'] -= $items[$item]['#grid']['push'];
        $items[$item]['#grid']['push'] = 0;
      }
      else if ($items[$item]['#grid']['pull'] > $items[$item]['#grid']['push']) {
        $items[$item]['#grid']['push'] -= $items[$item]['#grid']['pull'];
        $items[$item]['#grid']['pull'] = 0;
      }
      else if ($items[$item]['#grid']['pull'] == $items[$item]['#grid']['push']) {
        $items[$item]['#grid']['pull'] = 0;
        $items[$item]['#grid']['push'] = 0;
      }
    }
  }
}

/**
 * A helper function for retrieving the content of theme .info files
 * in the theme trail of $key.
 * 
 * @param $item
 *   The name of the variable that you want to fetch.
 * @param $theme
 *   The key (machin-readable name) of a theme.
 * @return
 *   The $item content of all themes .info files in the theme trail.
 */
function alpha_info($item, $theme) {
  $themes = list_themes();
  
  if (!empty($themes[$theme]->info[$item])) {
    return $themes[$theme]->info[$item];
  }
}

/**
 * Retrieves a .info element for the active theme trail.
 *
 * @param $item
 *   The name of the variable that you want to fetch.
 * @param $theme
 *   The key (machin-readable name) of a theme.
 * @return
 *   An array whoose keys are the theme names of the themes that provide
 *   information about $item. The array values represent the information about
 *   $item for the corresponding theme.
 */
function alpha_info_trail($item, $theme) {
  $output = array();
  
  if ($trail = alpha_theme_trail($theme)) {
    $themes = list_themes();

    foreach ($trail as $key => $name) {
      if (!empty($themes[$key]->info[$item])) {
        $output[$key] = $themes[$key]->info[$item];
      }
    }
  }
  
  return $output;
}

/**
 * Searches for a CSS file $name in $path by looking for common file types.
 *
 * @param $path
 *   The path of the folder that the file resides in.
 * @param $name
 *   The name of the file that you are looking for.
 * @return
 *   The path to the file if a file was found. FALSE otherwise.
 */
function alpha_find_stylesheet($path, $name) {
  foreach (array('css', 'css.less', 'sass', 'scss') as $extension) {
    $file = $path . '/' . $name . '.' . $extension;
    
    if (is_file($file)) {
      return $file;
    }
  }
  
  return FALSE;
}

/**
 * A helper function to check wether the user defined by $user
 * matches one of the roles defined by $roles.
 * 
 * @param $user
 *   A Drupal user as returned by user_load().
 * @param $roles
 *   An array of roles that you want to check against $user.
 * @return
 *   A boolean, indicating wether or not $user matches one of
 *   the $roles.
 */
function alpha_debug_access($user, $roles) {
  foreach ($roles as $role) {
    if (isset($user->roles[$role])) {
      return TRUE;
    } 
  }
  
  return FALSE;
}

/**
 * Helpfer function that sorts grid layouts.
 */
function alpha_sort_layouts($a, $b) {
  if ($a['enabled'] && !$b['enabled']) {
    return -1;
  }
  else if ($b['enabled'] && !$a['enabled']) {
    return 1;
  }
  else if ($b['weight'] > $a['weight']) {
    return -1;
  }
  else if ($a['weight'] > $b['weight']) {
    return 1;
  }
}

/**
 * Helper function that returns an array of Drupal core elements that Alpha
 * can toggle on and off.
 */
function alpha_toggle() {
  return array(
    'messages' => t('Messages'), 
    'action_links' => t('Action links'), 
    'tabs' => t('Tabs'), 
    'breadcrumb' => t('Breadcrumb'), 
    'page_title' => t('Page title'), 
    'feed_icons' => t('Feed icons'),
  );
}

/**
 * Helper function that returns an array of Drupal core elements that Alpha
 * can hide via CSS.
 */
function alpha_visibility() {
  return array(
    'title' => t('Page title'), 
    'site_name' => t('Site name'), 
    'site_slogan' => t('Site slogan'), 
  );
}

/**
 * A helper function that returns an array of un-supported Drupal core regions.
 */
function alpha_regions_exclude() {
  return array('page_top', 'page_bottom');
}
