<?php

/**
 * @file
 * Views handler to filter webforms by open or closed status.
 */
class webform_handler_filter_webform_status extends views_handler_filter_boolean_operator {
  function get_value_options() {
    if (!isset($this->value_options)) {
      $this->value_title = t('Status');
      $options = array('1' => t('Open'), '0' => t('Closed'));
      $this->value_options = $options;
    }
  }
}
