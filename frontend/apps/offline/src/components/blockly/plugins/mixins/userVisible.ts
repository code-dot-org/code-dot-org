import {PluginType} from '../../plugins';
import type {MixinPlugin} from '../../plugins';

/**
 * This mixin will react to any 'uservisible' attribute and
 * ensure that this block is not visible on a main workspace.
 */
export const UserVisibleBlockMixin = {
  visible: true,
  isVisible: function (): boolean {
    return this.visible;
  },
  setVisible: function (value: boolean) {
    this.visible = value;
    if (this.svgGroup_) {
      this.svgGroup_.style.visibility = value ? 'shown' : 'hidden';
    }
  },
  /*
  loadExtraState: function(state) {
    this.setVisible(state.uservisible);
  },
  saveExtraState: function() {
    return {
      uservisible: this.visible,
    };
  },
  */
};

export const plugin: MixinPlugin = {
  type: PluginType.Mixin,
  name: 'user_visible_mixin',
  mixin: UserVisibleBlockMixin,
  global: true,
};

export default plugin;
