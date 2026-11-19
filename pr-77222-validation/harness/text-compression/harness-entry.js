import $ from 'jquery';
import initializeCodeMirror6 from '@cdo/apps/code-studio/initializeCodeMirror6';
window.$ = window.jQuery = $;
window.initializeCodeMirror6 = initializeCodeMirror6;
// Minimal stand-in for dashboard's Dialog: renders the body inline.
window.Dialog = function (opts) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;top:120px;left:20%;width:60%;background:#fff;border:2px solid #888;padding:10px;z-index:9999';
  el.innerHTML = opts.body;
  this.show = () => document.body.appendChild(el);
  this.hide = () => el.remove();
};
