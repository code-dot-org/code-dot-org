// Ambient browser globals the studio app injects onto window, referenced from
// page.evaluate / page.waitForFunction callbacks (which run in the browser).

export {};

declare global {
  interface Window {
    /** The studio app's Blockly global; present once a Blockly lab has booted. */
    Blockly?: {
      getMainWorkspace(): BlocklyWorkspace | null;
      mainBlockSpace: {clear(): void};
      serialization: {
        workspaces: {load(state: object, workspace: object): void};
        blocks: {
          append(state: {type: string; id: string}, workspace: object): void;
        };
      };
    };
    /** Blockly's test-only interface, exposed on window by legacy labs. */
    __TestInterface?: {
      arrangeBlockPosition(blocksXml: string, options: object): string;
      loadBlocks(blocksXml: string): void;
    };
  }

  /** Minimal shape of a Blockly workspace, as used from page.evaluate. */
  interface BlocklyWorkspace {
    getBlockById(id: string): BlocklyBlock | null;
  }

  /** Minimal shape of a Blockly block, as used from page.evaluate. */
  interface BlocklyBlock {
    previousConnection: BlocklyConnection;
    inputList: {connection: BlocklyConnection | null}[];
  }

  /** Minimal shape of a Blockly connection, as used from page.evaluate. */
  interface BlocklyConnection {
    connect(other: BlocklyConnection): void;
  }
}
