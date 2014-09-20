<?php

/**
 * Implementation of hook_drush_command().
 */
function webform_drush_command() {
  $items = array();

  $items['webform-export'] = array(
    'description' => "Exports webform data in csv format.",
    'arguments' => array(
      'nid' => 'The node ID of the webform you want to export (required)',
    ),
    'options' => array(
      'batch-size' => 'The size of batches in rows (default 10000)',
      'start-batch' => 'The batch to start exporting from (default 0)',
      'end-batch' => 'The batch to end exporting from (defaults to all batches)',
      'file' => 'The file name to export to (defaults to print to stdout)',
      'skip-header' => 'Skip output of header rows (defaults to printing header)',
    ),
    'aliases' => array('wfx'),
  );
  
  return $items;
}

/**
 * Exports a webform in a series of batches, useful for large data dumps
 * that would otherwise time out due to memory consumption.
 *
 * @param int $nid
 *   Node ID of the webform that we want to export.
 * @param $file_name
 *   The name of the file where we're temporarily storing the exported webform data.
 *   Because this function calls itself repeatedly, you never need to specify a filename.
 *   It will be automatically generated on the first run, and will continue to use that file
 *   on all subsequent runs.
 * @param $batch
 *   Number of this particular batch run. Like $file_name, this shouldn't be called explicitly,
 *   but is passed back to this function on subsequent runs.
 */
function drush_webform_export($nid = FALSE, $file_name = NULL, $batch = NULL) {
  if (!$nid) {
    return drush_set_error('The node ID of the webform you want to export is required');
  }
  module_load_include('inc', 'webform', 'includes/webform.submissions');
  module_load_include('inc', 'webform', 'includes/webform.export');
  module_load_include('inc', 'webform', 'includes/webform.components');
  module_load_include('inc', 'webform', 'includes/webform.report');

  $node = node_load($nid);
  webform_results_download_options($node, $options, $submission_information);
  $batch_size = drush_get_option('batch-size', 10000);

  // Open a new Webform exporter object.
  $exporter = webform_export_create_handler('delimited', $options);
  if ($batch == NULL) {
    // On the initial run, set up the file and initiate the batch run.
    $file_name = drush_get_option('file', tempnam(variable_get('file_directory_temp', file_directory_temp()), 'webform'));
    $handle = @fopen($file_name, 'w'); // The @ suppresses errors.
    $exporter->bof($handle);
    if (!drush_get_option('skip-header', FALSE)) {
      webform_results_download_headers($node, $options, $submission_information, $exporter, $handle);
    }
    @fclose($handle);

    $batch = drush_get_option('start-batch', 0);
    // Determine the number of batches needed to get all results.
    $max_batch = ceil(max(webform_get_submission_count($node->nid), $batch_size)/$batch_size);
    // Allow the user to limit the number of batches, but not go beyond the maximum.
    $end_batch = min(drush_get_option('end-batch', $max_batch), $max_batch);

    // This is where we repeatedly call this function, by passing in the generated filename
    // and the updated $batch count.
    while ($batch < $end_batch) {
      drush_log(dt('Running batch !batch', array('!batch' => $batch)));
      drush_do_command_redispatch('webform-export', array($nid, $file_name, $batch));
      $batch++;
    }

    // Add the closing bytes.
    $handle = @fopen($file_name, 'a'); // The @ suppresses errors.
    $exporter->eof($handle);
    @fclose($handle);
    if (drush_get_option('file', FALSE) === FALSE) {
      // If no filename was specified, print the file and delete it.
      drush_print(file_get_contents($file_name));  // The @ makes it silent.
      @unlink($file_name);  // Clean up, the @ makes it silent.
    }
  }
  else {
    // Inside a specific batch run, we append results to the file.
    $handle = @fopen($file_name, 'a'); // The @ suppresses errors.
    $serial_start = $batch_size * $batch;
    $_GET['page'] = $batch;
    webform_results_download_rows($node, $options, $submission_information, $exporter, $file_name, $handle, $serial_start, $batch_size);
    @fclose($handle);
  }
}