<?php

/**
 * @file
 * Views handler to display the number of submissions in a webform.
 */

/**
 * Field handler to present the submission count of a node to the user.
 */
class webform_handler_field_submission_count extends views_handler_field {
  function construct() {
    parent::construct();
    $this->count_type = $this->definition['count_type'];

    if ($this->count_type == 'node') {
      $this->additional_fields['nid'] = 'nid';
      $this->additional_fields['type'] = 'type';
    }
    elseif ($this->count_type == 'users') {
      $this->additional_fields['uid'] = 'uid';
    }
  }

  function option_definition() {
    $options = parent::option_definition();
    $options['label'] = array('default' => '# of Submissions', 'translatable' => TRUE);
    return $options;
  }

  function query() {
    $this->ensure_my_table();
    $this->add_additional_fields();
  }

  function render($values) {
    global $user;

    $output = NULL;
    if ($this->count_type == 'node' && in_array($values->{$this->aliases['type']}, webform_variable_get('webform_node_types'))) {
      module_load_include('inc', 'webform', 'includes/webform.submissions');
      $node = node_load($values->{$this->aliases['nid']});
      if (webform_results_access($node, $user)) {
        $count = webform_get_submission_count($node->nid);
        $output = l($count, "node/$node->nid/webform-results");
      }
      else {
        $count = webform_get_submission_count($node->nid, $user->uid);
        $output = l($count, "node/$node->nid/submissions");
      }
    }
    elseif ($this->count_type == 'users') {
      $output = db_select('webform_submissions')
        ->condition('uid', $values->{$this->aliases['uid']})
        ->countQuery->execute()->fetchField();
    }

    return $output;
  }
}
