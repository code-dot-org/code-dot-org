<?php

/**
 * @file
 *   Provides several different handlers for exporting webform results.
 */

/**
 * Implements hook_webform_exporters().
 *
 * Defines the exporters this module implements.
 *
 * @return
 *   An "array of arrays", keyed by content-types. The 'handler' slot
 *   should point to the PHP class implementing this flag.
 */
function webform_webform_exporters() {
  return array(
    'delimited' => array(
      'title' => t('Delimited text'),
      'description' => t('A plain text file delimited by commas, tabs, or other characters.'),
      'handler' => 'webform_exporter_delimited',
    ),
    'excel' => array(
      'title' => t('Microsoft Excel'),
      'description' => t('A file readable by Microsoft Excel.'),
      'handler' => 'webform_exporter_excel',
    ),
  );
}

/**
 * Return a list of exporters suitable for display in a select list.
 */
function webform_export_list() {
  $exporters = webform_export_fetch_definition();
  $list = array();
  foreach ($exporters as $name => $exporter) {
    $list[$name] = $exporter['title'];
  }
  return $list;
}

/**
 * Returns a Webform exporter definition.
 */
function webform_export_fetch_definition($format = NULL) {
  static $cache;
  if (!isset($cache)) {
    $cache = module_invoke_all('webform_exporters');
  }

  if (isset($format)) {
    if (isset($cache[$format])) {
      return $cache[$format];
    }
  }
  else {
    return $cache;
  }
}

/**
 * Instantiates a new Webform handler based on the format.
 */
function webform_export_create_handler($format, $options) {
  $definition = webform_export_fetch_definition($format);
  if (isset($definition) && class_exists($definition['handler'])) {
    $handler = new $definition['handler']($options);
  }
  else  {
    // TODO: Create a default broken exporter.
    $handler = new webform_exporter_broken($options);
  }

  return $handler;
}

class webform_exporter {
  function add_row(&$file_handle, $data) {
  }

  function set_headers($filename) {
    drupal_add_http_header('Content-Type', 'application/force-download');
    drupal_add_http_header('Pragma', 'public');
    drupal_add_http_header('Cache-Control', 'max-age=0');
  }

  function bof(&$file_handle) {
  }

  function eof(&$file_handle) {
  }
}

class webform_exporter_delimited extends webform_exporter {
  var $delimiter;

  function webform_exporter_delimited($options) {
    $this->delimiter = isset($options['delimiter']) ? $options['delimiter'] : ',';
    // Convert tabs.
    if ($this->delimiter == '\t') {
      $this->delimiter = "\t";
    }
  }

  function bof(&$file_handle) {
    $output = '';

    // Include at BOM at the beginning of the file for Little Endian.
    // This makes tab-separated imports work correctly in MS Excel.
    if (function_exists('mb_convert_encoding') && $this->delimiter == "\t") {
      $output = chr(255) . chr(254);
    }
    @fwrite($file_handle, $output);
  }

  function add_row(&$file_handle, $data) {
    foreach ($data as $key => $value) {
      // Escape inner quotes and wrap all contents in new quotes.
      $data[$key] = '"' . str_replace('"', '""', $data[$key]) . '"';

      // Remove <script> tags, which mysteriously cause Excel not to import.
      $data[$key] = preg_replace('!<(/?script.*?)>!', '[$1]', $data[$key]);
    }
    $row = implode($this->delimiter, $data) . "\n";

    if (function_exists('mb_convert_encoding')) {
      $row = mb_convert_encoding($row, 'UTF-16LE', 'UTF-8');
    }

    @fwrite($file_handle, $row);
  }

  function set_headers($filename) {
    parent::set_headers($filename);

    // Convert tabs.
    if ($this->delimiter == "\t") {
      $extension = 'tsv';
      $content_type = 'text/tab-separated-values';
    }
    else {
      $extension = 'csv';
      $content_type = 'text/csv';
    }

    drupal_add_http_header('Content-Type', $content_type);
    drupal_add_http_header('Content-Disposition', "attachment; filename=$filename.$extension");
  }
}

/**
 * The Excel exporter currently is just a tab-delimited export.
 */
class webform_exporter_excel extends webform_exporter_delimited {
  var $delimiter;

  function webform_exporter_excel($options) {
    $options['delimiter'] = '\t';
    parent::webform_exporter_delimited($options);
  }

  function set_headers($filename) {
    drupal_add_http_header('Content-Type', 'application/x-msexcel');
    drupal_add_http_header('Content-Disposition', "attachment; filename=$filename.xls");
    drupal_add_http_header('Pragma', 'public');
    drupal_add_http_header('Cache-Control', 'max-age=0');
  }
}
