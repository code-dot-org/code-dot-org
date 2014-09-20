<?php

/**
 * @file
 * Webform module markup component.
 */

/**
 * Implements _webform_defaults_component().
 */
function _webform_defaults_markup() {
  return array(
    'name' => '',
    'form_key' => NULL,
    'pid' => 0,
    'weight' => 0,
    'value' => '',
    'extra' => array(
      'format' => NULL,
      'private' => FALSE,
    ),
  );
}

/**
 * Implements _webform_edit_component().
 */
function _webform_edit_markup($component) {
  $form = array();
  $form['value'] = array(
    '#type' => 'text_format',
    '#title' => t('Value'),
    '#default_value' => $component['value'],
    '#description' => t('Markup allows you to enter custom HTML or PHP logic into your form.') . theme('webform_token_help'),
    '#weight' => -1,
    '#format' => $component['extra']['format'],
    '#element_validate' => array('_webform_edit_markup_validate'),
  );

  return $form;
}

/**
 * Element validate handler; Set the text format value.
 */
function _webform_edit_markup_validate($form, &$form_state) {
  if (is_array($form_state['values']['value'])) {
    $form_state['values']['extra']['format'] = $form_state['values']['value']['format'];
    $form_state['values']['value'] = $form_state['values']['value']['value'];
  }
}

/**
 * Implements _webform_render_component().
 */
function _webform_render_markup($component, $value = NULL, $filter = TRUE) {
  $node = isset($component['nid']) ? node_load($component['nid']) : NULL;

  $element = array(
    '#type' => 'markup',
    '#title' => $filter ? NULL : $component['name'],
    '#weight' => $component['weight'],
    '#markup' => $filter ? _webform_filter_values(check_markup($component['value'], $component['extra']['format'], '', TRUE), $node, NULL, NULL, FALSE) : $component['value'],
    '#format' => $component['extra']['format'],
    '#theme_wrappers' => array('webform_element'),
    '#translatable' => array('title', 'markup'),
  );

  // TODO: Remove when #markup becomes available in D7.
  $element['#value'] = $element['#markup'];

  return $element;
}

/**
 * Implements _webform_display_component().
 */
function _webform_display_markup($component, $value, $format = 'html') {
  return array();
}
