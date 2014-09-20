<?php

/**
 * @file
 * Webform module page break component.
 */

/**
 * Implements _webform_defaults_component().
 */
function _webform_defaults_pagebreak() {
  return array(
    'name' => '',
    'form_key' => NULL,
    'pid' => 0,
    'weight' => 0,
    'extra' => array(
      'private' => FALSE,
      'next_page_label' => '',
      'prev_page_label' => '',
    ),
  );
}

/**
 * Implements _webform_theme_component().
 */
function _webform_theme_pagebreak() {
  return array(
    'webform_display_pagebreak' => array(
      'render element' => 'element',
      'file' => 'components/pagebreak.inc',
    ),
  );
}

/**
 * Implements _webform_edit_component().
 */
function _webform_edit_pagebreak($component) {
  $form = array();
  // Force the parent to always be root.
  $form['position']['pid'] = array(
    '#type' => 'hidden',
    '#value' => '0',
  );

  $form['display'] = array('#type' => 'markup'); // Hide the display options.

  $form['extra']['next_page_label'] = array(
    '#type' => 'textfield',
    '#title' => t('Next page button label'),
    '#description' => t('This is used for the <em>Next Page</em> button on the page before this page break. Default: <em>Next Page &gt;</em>'),
    '#default_value' => $component['extra']['next_page_label'],
    '#size' => 30,
  );
  $form['extra']['prev_page_label'] = array(
    '#type' => 'textfield',
    '#title' => t('Prev page button label'),
    '#description' => t('This is used for the <em>Prev Page</em> button on the page after this page break. Default: <em>&lt; Prev Page</em>'),
    '#default_value' => $component['extra']['prev_page_label'],
    '#size' => 30,
  );

  return $form;
}

/**
 * Implements _webform_render_component().
 */
function _webform_render_pagebreak($component, $value = NULL, $filter = TRUE) {
  $element = array(
    '#type' => 'hidden',
    '#value' => $component['name'],
    '#weight' => $component['weight'],
  );
  return $element;
}

/**
 * Implements _webform_render_component().
 */
function _webform_display_pagebreak($component, $value = NULL, $format = 'html') {
  $element = array(
    '#theme' => 'webform_display_pagebreak',
    '#title' => $component['name'],
    '#weight' => $component['weight'],
    '#format' => $format,
    '#translatable' => array('title'),
  );
  return $element;
}

/**
 * Format the text output data for this component.
 */
function theme_webform_display_pagebreak($variables) {
  $element = $variables['element'];

  return $element['#format'] == 'html' ? '<h2 class="webform-page">' . check_plain($element['#title']) . '</h2>' : "--" . $element['#title'] . "--\n";
}
