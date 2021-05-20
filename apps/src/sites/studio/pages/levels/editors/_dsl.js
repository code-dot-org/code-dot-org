import $ from 'jquery';

/**
 * @file Main entry point for scripts used only in levelbuilder when editing
 *       DSL-defined levels.
 */
var initializeEmbeddedMarkdownEditor = require('@cdo/apps/code-studio/initializeEmbeddedMarkdownEditor');

// Initialize markdown editors on page load
$(document).ready(function() {
  initializeEmbeddedMarkdownEditor(
    $('#level_dsl_text'),
    'level_markdown_textarea',
    'markdown'
  );
  initializeEmbeddedMarkdownEditor(
    $('#level_dsl_text'),
    'level_teacher_markdown_textarea',
    'teacher_markdown'
  );
});
