<?php

/**
 * @file
 * Views handler to filter submissions by draft state.
 */

/**
 * Filter by submission status
 */
class webform_handler_filter_is_draft extends views_handler_filter_in_operator {
  function get_value_options() {
    if (!isset($this->value_options)) {
      $this->value_title = t('Status');
      $options = array('0' => t('Completed'), '1' => t('Draft'));
      $this->value_options = $options;
    }
  }

  // '0' won't work as a key for checkboxes.
  function value_form(&$form, &$form_state) {
    parent::value_form($form, $form_state);
    $form['value']['#type'] = 'select';
  }
}
