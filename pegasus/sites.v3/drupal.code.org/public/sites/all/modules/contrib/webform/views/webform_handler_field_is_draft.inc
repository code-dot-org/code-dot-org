<?php

/**
 * @file
 * Views handler to display the draft status of a submission.
 */

/**
 * Field handler to show if submission is draft or not.
 *
 * @ingroup views_field_handlers
 */
class webform_handler_field_is_draft extends views_handler_field {
  function render($values) {
    $is_draft = $values->{$this->field_alias};
    return $is_draft ? t('draft') : t('completed');
  }
}
