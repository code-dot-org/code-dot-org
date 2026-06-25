// HiddenUploader (used by the classic AnimationPicker's upload flow) relies on
// the blueimp jQuery File Upload plugin ($.fn.fileupload). The classic level
// page loads it via <script> tags (see _apps_dependencies.html.haml), but the
// Lab2 page does not, so $.fn.fileupload is undefined and HiddenUploader's
// componentDidMount throws. The global jQuery already has $.widget (its only
// dependency), so we just load the plugin scripts onto it on demand.

interface JQueryWithFileUpload {
  fn?: {fileupload?: unknown};
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

let pluginPromise: Promise<void> | null = null;

export function loadFileUploadPlugin(): Promise<void> {
  const jq = (window as {jQuery?: JQueryWithFileUpload}).jQuery;
  if (jq?.fn?.fileupload) {
    return Promise.resolve();
  }
  if (!pluginPromise) {
    pluginPromise = loadScript(
      '/blockly/js/fileupload/jquery.iframe-transport.js'
    ).then(() => loadScript('/blockly/js/fileupload/jquery.fileupload.js'));
  }
  return pluginPromise;
}
