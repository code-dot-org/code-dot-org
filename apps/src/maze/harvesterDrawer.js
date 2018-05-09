import Drawer from './drawer';

export default class HarvesterDrawer extends Drawer {
  constructor(map, skin, svg, subtype) {
    super(map, '', svg);
    this.skin_ = skin;
    this.subtype_ = subtype;
  }

  /**
   * @override
   */
  getAsset(prefix, row, col) {
    switch (prefix) {
      case 'sprout':
        return this.skin_.sprout;
      case 'crop':
        var crop = this.subtype_.getCell(row, col).featureName();
        return this.skin_[crop];
    }
  }

  /**
   * Override DirtDrawer's updateItemImage.
   * @override
   * @param {number} row
   * @param {number} col
   * @param {boolean} running Is user code currently running
   */
  updateItemImage(row, col, running) {
    let variableCell = this.map_.getVariableCell(row, col);
    let cell = this.map_.getCell(row, col);

    if (!variableCell.hasValue()) {
      return;
    }

    // Image
    if (cell.startsHidden() && !running) {
      this.show('sprout', row, col);
      this.hide('crop', row, col);
    } else {
      if (cell.getCurrentValue() > 0) {
        this.show('crop', row, col);
      } else {
        this.hide('crop', row, col);
      }
      this.hide('sprout', row, col);
    }

    // Counter
    if (running) {
      if (cell.getCurrentValue() > 0) {
        this.updateOrCreateText_('counter', row, col, cell.getCurrentValue());
      } else {
        this.updateOrCreateText_('counter', row, col, '');
      }
    } else {
      if (cell.startsHidden()) {
        this.updateOrCreateText_('counter', row, col, '');
      } else if (variableCell.isVariableRange()) {
        this.updateOrCreateText_('counter', row, col, '?');
      } else {
        this.updateOrCreateText_('counter', row, col, cell.getCurrentValue());
      }
    }
  }

  hide(prefix, row, col) {
    const element = this.getOrCreateImage_(prefix, row, col);
    if (element) {
      element.setAttribute('visibility', 'hidden');
    }
  }

  show(prefix, row, col) {
    this.drawImage_(prefix, row, col);
  }
}
