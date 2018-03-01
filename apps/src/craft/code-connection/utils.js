import { parseElement, serialize } from '../../xml';

export function convertBlocksXml(xmlString) {
  const xml = parseElement(xmlString);

  for (let i = 0, xmlChild; (xmlChild = xml.childNodes[i]); i++) {
    if (xmlChild.nodeName.toLowerCase() === 'block') {
      convertBlockXml(xmlChild);
    }
  }

  const result = serialize(xml);
  return result;
}

function getChildNodeByName(node, type) {
  for (let i = 0, child; (child = node.childNodes[i]); i++) {
    if (child.nodeName.toLowerCase() === type) {
      return child;
    }
  }
}

function getTitleByNameAttr(node, name) {
  for (let i = 0, child; (child = node.childNodes[i]); i++) {
    if (child.nodeName.toLowerCase() === "title" && child.getAttribute('name') === name) {
      return child;
    }
  }
}

// The order of blocks as they appear in the agent inventory within MC:EE, so we
// can translate the placeBlock block from string identifiers to indexes.
const blockPlaceOrder = [
  "bricks",
  "cobblestone",
  "dirt",
  "grass",
  "gravel",
  "ice",
  "logAcacia",
  "logBirch",
  "logJungle",
  "logOak",
  "logSpruce",
  "planksAcacia",
  "planksBirch",
  "planksJungle",
  "planksOak",
  "planksSpruce",
  "rails",
  "sand",
  "sandstone",
  "snow",
  "stone",
  "wool_blue",
  "wool_magenta",
  "wool_orange",
  "wool_pink",
  "wool_red",
  "wool_yellow",
];

// Agent code uses numbers for relative directions; semantically they represent
// the number of 90-degree right turns from forward. CodeBuilder uses strings,
// this is the simple mapping
const directionToString = Object.freeze({
  0: 'forward',
  1: 'right',
  2: 'back',
  3: 'left'
});

// Map naming scheme for Agent-style block types to CodeBuilder-style block
// types. BlockTypes not included here should be identical between the two
// versions
const blockTypes = Object.freeze({
  // Standard blocks
  bricks: "brick_block",
  clayHardened: "hardened_clay",
  oreCoal: "coal_ore",
  oreDiamond: "diamond_ore",
  oreEmerald: "emerald_ore",
  oreGold: "gold_ore",
  oreIron: "iron_ore",
  oreLapis: "lapis_ore",
  oreRedstone: "redstone_ore",
  deadBush: "deadbush",
  netherBrick: "netherbrick",
  quartzOre: "ore_quartz",
  topSnow: "snow_layer",

  // Blocks for which CC does not have a version
  dirtCoarse: "dirt",
  farmlandWet: "dirt",
  lava: "dirt",
  water: "dirt",
  grassPath: "dirt",
  snowyGrass: "dirt",
  tnt: "dirt",
  tree: "dirt",
  wool: "dirt",

  // Tree parts
  logAcacia: "log2,0",
  logBirch: "log,2",
  logJungle: "log,3",
  logOak: "log",
  logSpruce: "log,1",

  planksAcacia: "planks,4",
  planksBirch: "planks,2",
  planksJungle: "planks,3",
  planksOak: "planks",
  planksSpruce: "planks,1",
});

const blockConversions = Object.freeze({
  craft_moveForward: function (xml) {
    const next = getChildNodeByName(xml, 'next');

    return (`
      <block type="craft_move">
        <title name="DIR">forward</title>
        ${next ? serialize(next) : ''}
      </block>
    `);
  },

  craft_moveBackward: function (xml) {
    const next = getChildNodeByName(xml, 'next');

    return (`
      <block type="craft_move">
        <title name="DIR">back</title>
        ${next ? serialize(next) : ''}
      </block>
    `);
  },

  craft_placeBlock: function (xml) {
    const next = getChildNodeByName(xml, 'next');
    const title = getChildNodeByName(xml, 'title');
    const blockType = title.textContent;
    // placement slots are one-indexed and should default to 1
    const blockIndex = (blockPlaceOrder.indexOf(blockType) + 1) || 1;
    return (`
      <block type="craft_place" inline="false">
        <title name="DIR">down</title>
        <value name="SLOTNUM">
          <block type="math_number">
            <title name="NUM">${blockIndex}</title>
          </block>
        </value>
        ${next ? serialize(next) : ''}
      </block>
    `);
  },

  craft_placeBlockDirection: function (xml) {
    const next = getChildNodeByName(xml, 'next');
    const blockType = getTitleByNameAttr(xml, 'TYPE').textContent;
    const direction = getTitleByNameAttr(xml, 'DIR').textContent;
    // placement slots are one-indexed and should default to 1
    const blockIndex = (blockPlaceOrder.indexOf(blockType) + 1) || 1;

    return (`
      <block type="craft_place" inline="false">
        <title name="DIR">${directionToString[direction]}</title>
        <value name="SLOTNUM">
          <block type="math_number">
            <title name="NUM">${blockIndex}</title>
          </block>
        </value>
        ${next ? serialize(next) : ''}
      </block>
    `);
  },

  craft_destroyBlock: function (xml) {
    const next = getChildNodeByName(xml, 'next');
    return (`
      <block type="craft_destroy">
        <title name="DIR">forward</title>
        ${next ? serialize(next) : ''}
      </block>
    `);
  },

  craft_whileBlockAhead: function (xml) {
    const statement = getChildNodeByName(xml, 'statement');
    const next = getChildNodeByName(xml, 'next');
    const title = getChildNodeByName(xml, 'title');

    let blockType = title.textContent;
    if (blockTypes[blockType]) {
      blockType = blockTypes[blockType];
    }

    return (`
      <block type="controls_whileUntil" inline="false">
        <title name="MODE">WHILE</title>
        <value name="BOOL">
          <block type="logic_compare" inline="true">
            <title name="OP">EQ</title>
            <value name="A">
              <block type="craft_inspect">
                <title name="DIR">forward</title>
              </block>
            </value>
            <value name="B">
              <block type="craft_getnameof" inline="false">
                <value name="ITEM">
                  <block type="craft_block">
                    <title name="BLOCK">${blockType}</title>
                  </block>
                </value>
              </block>
            </value>
          </block>
        </value>
        ${statement ? serialize(statement) : ''}
        ${next ? serialize(next) : ''}
      </block>
    `);
  },

  craft_ifBlockAhead: function (xml) {
    const statement = getChildNodeByName(xml, 'statement');
    const next = getChildNodeByName(xml, 'next');
    const title = getChildNodeByName(xml, 'title');

    // ifBlockAhead statements are named "DO" (without the 0), but the default
    // controls_if is modular and so numbers its statements
    if (statement) {
      statement.setAttribute('name', 'DO0');
    }

    let blockType = title.textContent;
    if (blockTypes[blockType]) {
      blockType = blockTypes[blockType];
    }

    return (`
      <block type="controls_if" inline="false">
        <value name="IF0">
          <block type="logic_compare" inline="true">
            <title name="OP">EQ</title>
            <value name="A">
              <block type="craft_inspect">
                <title name="DIR">forward</title>
              </block>
            </value>
            <value name="B">
              <block type="craft_getnameof" inline="false">
                <value name="ITEM">
                  <block type="craft_block">
                    <title name="BLOCK">${blockType}</title>
                  </block>
                </value>
              </block>
            </value>
          </block>
        </value>
        ${statement ? serialize(statement) : ''}
        ${next ? serialize(next) : ''}
      </block>
    `);
  }

});

function convertBlockXml(blockXml) {
  const type = blockXml.getAttribute('type');

  // Recursively process children
  for (let i = 0, xmlChild; (xmlChild = blockXml.childNodes[i]); i++) {
    if (
      (
        xmlChild.nodeName.toLowerCase() === "next" ||
        xmlChild.nodeName.toLowerCase() === "statement"
      ) && xmlChild.childNodes.length) {
      convertBlockXml(xmlChild.childNodes[0]);
    }
  }

  // inline-replace block if it is one of the types that should be converted
  if (blockConversions[type]) {
    const newBlockString = blockConversions[type](blockXml);
    const newBlock = new DOMParser().parseFromString(newBlockString, 'text/xml').firstChild;
    blockXml.parentNode.replaceChild(newBlock, blockXml);
  }
}
