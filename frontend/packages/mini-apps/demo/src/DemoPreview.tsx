/**
 * Visualization for the demo mini-app. Renders a static placeholder so
 * codebridge has something to mount and the abstraction can be exercised
 * end-to-end. Real mini-apps would observe their own MiniApp instance
 * (signal count, level state, etc.) here.
 */
const DemoPreview = () => {
  return (
    <div
      style={{
        padding: 16,
        fontFamily: 'monospace',
        border: '1px dashed #888',
        borderRadius: 4,
      }}
    >
      <strong>Demo mini-app loaded.</strong>
      <p style={{margin: '8px 0 0', fontSize: 12, opacity: 0.7}}>
        Stub used to validate the MiniApp abstraction across packages.
      </p>
    </div>
  );
};

export default DemoPreview;
