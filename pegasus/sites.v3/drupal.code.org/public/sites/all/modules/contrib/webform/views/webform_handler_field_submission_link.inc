<?php

/**
 * @file
 * Views handler to display links to a submission.
 */

/**
 * Field handler to present a link to the user.
 */
class webform_handler_field_submission_link extends views_handler_field {
  var $link_type;

  function construct() {
    // We need to set this property before calling the construct() chain
    // as we use it in the option_definintion() call.
    $this->link_type = $this->definition['link_type'];

    parent::construct();
    $this->additional_fields['sid'] = 'sid';
    $this->additional_fields['nid'] = 'nid';
    $this->additional_fields['uid'] = 'uid';

    $this->additional_fields['node_uid'] = array(
      'table' => 'node',
      'field' => 'uid',
    );
  }

  function allow_advanced_render() {
    return FALSE;
  }

  function option_definition() {
    $options = parent::option_definition();
    $options['label'] = array('default' => '', 'translatable' => TRUE);
    $options['text'] = array('default' => $this->link_type, 'translatable' => TRUE);
    return $options;
  }

  function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);
    $form['text'] = array(
      '#type' => 'textfield',
      '#title' => t('Text to display'),
      '#default_value' => $this->options['text'],
    );
  }

  function query() {
    $this->ensure_my_table();

    // Join to the node table to retrieve the node UID.
    $join = new views_join();
    $join->construct('node', $this->table_alias, 'nid', 'nid');
    $this->query->ensure_table('node', $this->relationship, $join);

    $this->add_additional_fields();
  }

  function render($values) {
    $submission = new stdClass();
    $submission->sid = $values->{$this->aliases['sid']};
    $submission->nid = $values->{$this->aliases['nid']};
    $submission->uid = $values->{$this->aliases['uid']};
    $node = (object) array(
      'nid' => $submission->nid,
      'uid' => $values->{$this->aliases['node_uid']},
    );

    switch ($this->link_type) {
      case 'view':
        $text = !empty($this->options['text']) ? $this->options['text'] : t('view');
        $link = l($text, "node/$submission->nid/submission/$submission->sid");
        $access = webform_submission_access($node, $submission, 'view');
        break;
      case 'edit':
        $text = !empty($this->options['text']) ? $this->options['text'] : t('edit');
        $link = l($text, "node/$submission->nid/submission/$submission->sid/edit");
        $access = webform_submission_access($node, $submission, 'edit');
        break;
      case 'delete':
        $text = !empty($this->options['text']) ? $this->options['text'] : t('delete');
        $path = drupal_get_path_alias($_GET['q']);
        $link = l($text, "node/$submission->nid/submission/$submission->sid/delete", array('query' => array('destination' => $path)));
        $access = webform_submission_access($node, $submission, 'delete');
        break;
      default:
        $text = '';
        $link = NULL;
        $access = FALSE;
    }

    if (!$access) {
      return;
    }

    return $link;
  }
}
