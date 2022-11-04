export type DropletBlock = {
  block: string
  title: string
}

export type DropletCategory = {
  name: string
  color: string
  blocks: DropletBlock[]
}

// TODO: make this function async for blocks loaded from server
// TODO: extend this for Blockly
export type BlockFactory = () => DropletCategory[]