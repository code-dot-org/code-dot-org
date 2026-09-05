const {
  North,
  South,
  East,
  West,
} = require("./FacingDirection.js");

module.exports = class LevelBlock {
  constructor(blockType) {
    this.blockType = blockType;

    // Default values apply to simple, action-plane destroyable blocks
    this.isEntity = false;
    this.isWalkable = false;
    this.isPlacable = false; // whether another block can be placed in this block's spot
    this.isDestroyable = true;
    this.isUsable = true;
    this.isEmpty = false;
    this.isEmissive = false;
    this.isTransparent = false;
    this.isRedstone = false;
    this.isPowered = false;
    this.isConnectedToRedstone = false; // can this block connect to nearby redstone wire
    this.isRedstoneBattery = false;
    this.isOpen = false;
    this.isRail = false;
    this.isSolid = true;
    this.isWeaklyPowerable = true;
    this.isStickable = true;
    this.isActivatedConduit = false;

    if (blockType === "") {
      this.isWalkable = true;
      this.isDestroyable = false;
      this.isEmpty = true;
      this.isPlacable = true;
      this.isUsable = false;
      this.isWeaklyPowerable = false;
    }

    if (this.getIsMiniblock()) {
      this.isEntity = true;
      this.isWalkable = true;
      this.isDestroyable = false;
      this.isPlacable = true;
      this.isUsable = false;
      this.isTransparent = true;
    }

    if (blockType.match('torch')) {
      this.isWalkable = true;
      this.isPlacable = true;
      this.isStickable = false;
    }

    if (blockType.substring(0, 5) === "rails") {
      this.isWeaklyPowerable = blockType === 'railsRedstoneTorch' ? true : false;
      this.isStickable = blockType === 'railsRedstoneTorch' ? false : true;
      this.isEntity = true;
      this.isWalkable = true;
      this.isUsable = true;
      this.isDestroyable = true;
      this.isTransparent = true;
      this.isRail = blockType !== "railsRedstoneTorch";
      this.isConnectedToRedstone = /^rails(RedstoneTorch|Unpowered|Powered)/.test(blockType);
      this.isRedstoneBattery = blockType === "railsRedstoneTorch";
      this.connectionA = undefined;
      this.connectionB = undefined;
    }

    if (blockType === "sheep") {
      this.isEntity = true;
      this.isDestroyable = false;
      this.isUsable = true;
    }

    if (blockType === "invisible") {
      this.isDestroyable = false;
      this.isUsable = false;
      this.isWeaklyPowerable = false;
      this.isEmissive = true;
    }

    if (blockType.startsWith("glass")) {
      this.isSolid = false;
    }

    if (blockType.startsWith("ice")) {
      this.isSolid = false;
    }

    if (blockType === "creeper") {
      this.isEntity = true;
    }

    if (blockType === "bedrock") {
      this.isDestroyable = false;
    }

    if (blockType === "lava") {
      this.isEmissive = true;
      this.isWalkable = true;
      this.isPlacable = true;
    }

    if (blockType === "magmaUnderwater" || blockType === "magmaDeep") {
      this.isEmissive = true;
    }

    if (blockType === "bubbleColumn") {
      this.isSolid = false;
      this.isTransparent = true;
      this.isEntity = true;
    }

    if (blockType === "conduit") {
      this.isSolid = false;
      this.isEntity = true;
    }

    if (blockType === "water") {
      this.isPlacable = true;
    }

    if (blockType === "torch") {
      this.isEmissive = true;
      this.isEntity = true;
      this.isWalkable = true;
      this.isUsable = true;
      this.isDestroyable = false;
      this.isTransparent = true;
    }

    if (blockType === "cropWheat") {
      this.isEntity = true;
      this.isWalkable = true;
      this.isUsable = true;
      this.isDestroyable = false;
      this.isTransparent = true;
    }

    if (blockType === "tnt") {
      this.isUsable = true;
      this.isDestroyable = true;
    }

    if (blockType === "door") {
      this.isWeaklyPowerable = false;
      this.isSolid = false;
      this.isEntity = true;
      this.isWalkable = false;
      this.isUsable = true;
      this.isDestroyable = false;
      this.isTransparent = true;
      this.isStickable = false;
    }

    if (blockType === "doorIron") {
      this.isWeaklyPowerable = false;
      this.isSolid = false;
      this.isEntity = true;
      this.isWalkable = false;
      this.isDestroyable = false;
      this.isTransparent = true;
      this.isConnectedToRedstone = true;
      this.isStickable = false;
    }

    if (blockType.startsWith("redstoneWire")) {
      this.isEntity = true;
      this.isWalkable = true;
      this.isUsable = true;
      this.isDestroyable = true;
      this.isTransparent = true;
      this.isRedstone = true;
      this.isStickable = false;
    }

    if (blockType.startsWith("pressurePlate")) {
      this.isWeaklyPowerable = blockType === 'pressurePlateUp' ? false : true;
      this.isEntity = true;
      this.isWalkable = true;
      this.isDestroyable = false;
      this.isTransparent = true;
      this.isConnectedToRedstone = true;
      this.isRedstoneBattery = blockType === 'pressurePlateUp' ? false : true;
      this.isStickable = false;
    }

    if (blockType === "glowstone") {
      this.isEntity = true;
    }

    if (blockType === "bedFoot" || blockType === "bedHead") {
      this.isEntity = true;
    }

    if (blockType.startsWith("piston")) {
      this.isWeaklyPowerable = false;
      this.isSolid = false;
      this.isDestroyable = false;
      this.isConnectedToRedstone = !blockType.startsWith("pistonArm");
      if (blockType.substring(blockType.length - 2, blockType.length) === "On" ||
        blockType.startsWith("pistonArm") ||
        blockType.substring(blockType.length - 8, blockType.length) === "OnSticky"
      ) {
        this.isEntity = true;
      }
    }

    if (
      blockType.startsWith("flower") ||
      (/coral/i.test(blockType) && !/Block/.test(blockType)) ||
      blockType === 'seaGrass' ||
      blockType === 'kelp' ||
      blockType === 'seaPickles'
    ) {
      this.isWalkable = true;
      this.isEntity = true; // Don't show shadows or AO -- we should rename this option.
    }

    if (blockType === 'seaPickles' || blockType === 'seaLantern' || blockType === 'magmaBlock') {
      this.isEmissive = true;
    }
  }

  /**
   * Does the given block type represent a "flat" block?
   * "flat" blocks are those subset of walkable blocks which are walkable
   * because they are lying right on the ground, as opposed to those blocks like
   * torches which are walkable because they do not occupy very much space.
   *
   * @return {boolean}
   */
  isFlat() {
    return this.isRail ||
        this.isRedstone ||
        this.blockType.startsWith("pressurePlate");
  }

  notValidOnGroundPlane() {
    return this.blockType.startsWith("rails") || this.blockType.startsWith("redstone");
  }

  skipsDestructionOverlay() {
    return this.isRedstone ||
      this.blockType === "torch" ||
      this.blockType === "railsRedstoneTorch";
  }

  shouldRenderOnGroundPlane() {
    return this.isFlat();
  }

  getIsPowerableRail() {
    return this.isRail && this.isConnectedToRedstone;
  }

  /**
   * Helper method specifically for powered rails, which can only be veritical
   * or horizontal.
   *
   * @return {boolean}
   */
  getIsHorizontal() {
    return this.blockType.match('East|West');
  }

  /**
   * Helper method specifically for powered rails, which can only be veritical
   * or horizontal.
   *
   * @return {boolean}
   */
  getIsVertical() {
    return this.blockType.match('North|South');
  }

  getIsStickyPiston() {
    return this.blockType.substring(this.blockType.length - 6, this.blockType.length) === "Sticky";
  }

  canHoldCharge() {
    return this.isSolid;
  }

  /**
   * @see {LevelBlock.isMiniblock}
   * @return {boolean}
   */
  getIsMiniblock() {
    return LevelBlock.isMiniblock(this.blockType);
  }

  /**
   * @see {LevelBlock.isChestBlock}
   * @return {boolean}
   */
  getIsChestblock() {
    return LevelBlock.isChestblock(this.blockType);
  }

  getIsTree() {
    return !!this.blockType.match(/^tree/);
  }

  getIsDoor() {
    return this.blockType.startsWith("door");
  }

  getIsConduit() {
    return this.blockType.startsWith("conduit");
  }

  getIsLiquid() {
    return this.blockType === "water" ||
        this.blockType === "magmaUnderwater" ||
        this.blockType === "lava";
  }

  getCanFall() {
    return this.blockType === "sand" ||
        this.blockType === "gravel";
  }

  /**
   * Can this block be placed in liquid to replace a liquid block? Should
   * generally be true for all "standard" blocks like cobblestone and dirt, and
   * false for all "special" blocks like redstone and torches.
   *
   * @return {boolean}
   */
  getIsPlaceableInLiquid() {
    const notPlaceable =
      this.isRedstone ||
      this.getIsPiston() ||
      this.isRail ||
      this.blockType === 'torch' ||
      this.blockType === 'railsRedstoneTorch' ||
      this.blockType === 'pressurePlateUp';

    return !notPlaceable;
  }

  /**
   * Note that this will be true for blocks representing the unpowered piston,
   * the "base" of the powered piston, AND the extended arm of the powered
   * piston
   *
   * @return {boolean}
   */
  getIsPiston() {
    return this.blockType.startsWith("piston");
  }

  /**
   * @return {boolean}
   */
  getIsPistonArm() {
    return this.blockType.startsWith("pistonArm");
  }

  getIsPushable() {
    return this.blockType !== "" && !this.isDestroyableUponPush();
  }

  isDestroyableUponPush() {
    return this.blockType.startsWith("redstone") || this.blockType.startsWith("door") || this.blockType.startsWith("railsRedstone") || this.blockType.startsWith("pressure");
  }

  needToRefreshRedstone(){
    if (this.isRedstone || this.blockType === '' || (this.isConnectedToRedstone && !this.blockType.startsWith("piston"))) {
      return true;
    } else {
      return false;
    }
  }

  getPistonDirection() {
    if (this.blockType.startsWith("piston")) {
      let direction = this.blockType.substring(6, 7);
      switch (direction) {
        case "D":
          return South;
        case "U":
          return North;
        case "L":
          return West;
        case "R":
          return East;
      }
    }
  }

  getIsEmptyOrEntity() {
    return this.isEmpty || this.isEntity;
  }

  /**
   * Static to determine if a block would fall from Action Plane into Ground Plane.
   * @param {String} blockType
   * @return {boolean}
   */
  static getCanFall(blockType) {
    return new LevelBlock(blockType).getCanFall();
  }

  /**
   * Static to determine if a block is placeable over water at all.
   * @param {String} blockType
   * @return {boolean}
   */
  static getIsPlaceableInLiquid(blockType) {
    return new LevelBlock(blockType).getIsPlaceableInLiquid();
  }

  /**
   * Static passthrough to the isWalkable property for the given blockType.
   * TODO @hamms: remove this method once all calling methods have been updated
   *      to operate on actual LevelBlocks rather than blockType strings
   *
   * @param {String} blockType
   * @return {boolean}
   */
  static isWalkable(blockType) {
    return new LevelBlock(blockType).isWalkable;
  }

  /**
   * Does the given block type represent a miniblock?
   * TODO @hamms: remove this method once all calling methods have been updated
   *      to operate on actual LevelBlocks rather than blockType strings
   *
   * @param {String} blockType
   * @return {boolean}
   */
  static isMiniblock(blockType) {
    return blockType.endsWith("Miniblock");
  }

  /**
   * Does the given block type represent a chest that reveals a miniblock?
   * TODO @hamms: remove this method once all calling methods have been updated
   *      to operate on actual LevelBlocks rather than blockType strings
   *
   * @param {String} blockType
   * @return {boolean}
   */
  static isChestblock(blockType) {
    return blockType.endsWith("Chest");
  }

  /**
   * Static passthrough to the isWalkable property for the given blockType.
   * TODO @hamms: remove this method once all calling methods have been updated
   *      to operate on actual LevelBlocks rather than blockType strings
   *
   * @param {String} blockType
   * @return {boolean}
   */
  static isFlat(blockType) {
    return new LevelBlock(blockType).isFlat();
  }

  static skipsDestructionOverlay(blockType) {
    return new LevelBlock(blockType).skipsDestructionOverlay();
  }

  static notValidOnGroundPlane(blockType) {
    return new LevelBlock(blockType).notValidOnGroundPlane();
  }

  /**
   * For any given block type, get the appropriate mini block frame (as defined
   * in LevelView.miniblocks) if it exists.
   *
   * For miniblock block types, this should be the miniblock itself, so this
   * means simply removing the "Miniblock" identifier, so a "diamondMiniblock"
   * block will produce a "diamond" frame.
   *
   * For regular block types, this should be the miniblock produced when
   * destroying the block type, so a "oreDiamond" block will produce a "diamond"
   * frame
   *
   * @param {String} blockType
   * @return {String} frame identifier
   */
  static getMiniblockFrame(blockType) {
    if (blockType === "railsRedstoneTorch") {
      return "redstoneTorch";
    }

    if (blockType.startsWith("rails")) {
      return "railNormal";
    }

    if (blockType.endsWith("Chest")) {
      return "chest";
    }

    if (blockType.startsWith("glass") || blockType.startsWith("ice")) {
      return undefined;
    }

    // We use the same miniblock for -all- restoneWire
    if (blockType.substring(0,12) === "redstoneWire") {
      return "redstoneDust";
    }

    // Miniblock block types are suffixed with the string "Miniblock"
    if (LevelBlock.isMiniblock(blockType)) {
      return blockType.replace("Miniblock", "");
    }

    // For everything else, simply map the block type to the desired miniblock
    let frame = blockType;

    switch (frame) {
      case "treeAcacia":
      case "treeBirch":
      case "treeJungle":
      case "treeOak":
      case "treeSpruce":
      case "treeSpruceSnowy":
        frame = "log" + frame.substring(4);
        break;
      case "stone":
        frame = "cobblestone";
        break;
      case "oreCoal":
        frame = "coal";
        break;
      case "oreDiamond":
        frame = "diamond";
        break;
      case "oreIron":
        frame = "ingotIron";
        break;
      case "oreLapis":
        frame = "lapisLazuli";
        break;
      case "oreGold":
        frame = "ingotGold";
        break;
      case "oreEmerald":
        frame = "emerald";
        break;
      case "oreRedstone":
        frame = "redstoneDust";
        break;
      case "grass":
        frame = "dirt";
        break;
      case "tnt":
        frame = "gunPowder";
        break;
    }

    return frame;
  }
};
