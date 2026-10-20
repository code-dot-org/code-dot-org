import {queryParams} from '@cdo/apps/code-studio/utils';

/** The lab's optional layouts, each chosen by a query parameter. */
export interface BarLayout {
  /** The preview column's side; `?preview=right` moves it. */
  previewSide: 'left' | 'right';
  /** The scene row sits under the workspace; `?bar=top` puts it above. */
  barAtBottom: boolean;
  /**
   * `?bar=workspace`: a bar at the editors' base replaces the scene row,
   * holding a dropdown of the scenes.
   */
  barInWorkspace: boolean;
  /**
   * `?bar=workspace-top`: the dropdown at the workspace strip's start, undo
   * and redo joining the switch.
   */
  scenesInStrip: boolean;
  /** `?bar=preview-top`: the dropdown at the Preview bar's start. */
  scenesInPreviewBar: boolean;
  /**
   * The dropdown stands in a strip: no scene row, and no row for the
   * resource buttons.
   */
  scenesInAStrip: boolean;
  /**
   * The resource panel's buttons sit at a bar's end and the panel is gone,
   * giving the lab its width; `?resources=panel` or `?resources=bar`
   * decides either way. Without a scene row the panel is the default.
   */
  resourcesInBar: boolean;
  /**
   * A Preview bar across the stage column's top; `?preview-bar=false`
   * drops it, unless the scene dropdown stands there.
   */
  previewBarShown: boolean;
  /** The chosen picture's side in the Images pane; `?jumbo=left` moves it. */
  jumboSide: 'left' | 'right';
  /** `?editors=stripleft`: the switch at the workspace strip's start. */
  editorsAtStart: boolean;
}

/** A query parameter's value, by name. */
export type ParamReader = (name: string) => unknown;

export function readBarLayout(param: ParamReader = queryParams): BarLayout {
  const barMode = param('bar');
  const scenesInStrip = barMode === 'workspace-top';
  const scenesInPreviewBar = barMode === 'preview-top';
  const scenesInAStrip = scenesInStrip || scenesInPreviewBar;
  const resources = param('resources');
  return {
    previewSide: param('preview') === 'right' ? 'right' : 'left',
    barAtBottom: barMode !== 'top',
    barInWorkspace: barMode === 'workspace',
    scenesInStrip,
    scenesInPreviewBar,
    scenesInAStrip,
    resourcesInBar:
      resources === 'bar' || (resources !== 'panel' && !scenesInAStrip),
    previewBarShown: param('preview-bar') !== 'false' || scenesInPreviewBar,
    jumboSide: param('jumbo') === 'left' ? 'left' : 'right',
    editorsAtStart: param('editors') === 'stripleft',
  };
}
