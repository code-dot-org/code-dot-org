// Ambient browser globals the studio app injects onto window, referenced from
// page.evaluate / page.waitForFunction callbacks (which run in the browser).

export {};

declare global {
  interface Window {
    /** The studio app's Blockly global; present once a Blockly lab has booted. */
    Blockly?: {
      getMainWorkspace(): object | null;
      mainBlockSpace: {clear(): void};
      serialization: {
        workspaces: {load(state: object, workspace: object): void};
      };
    };
    /** Blockly's test-only interface, exposed on window by legacy labs. */
    __TestInterface?: {
      arrangeBlockPosition(blocksXml: string, options: object): string;
      loadBlocks(blocksXml: string): void;
    };
  }
}
