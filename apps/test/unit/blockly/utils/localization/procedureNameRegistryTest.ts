import * as BlocklyCore from 'blockly/core';

import {
  isTranslatable,
  onRegistryChange,
  setCurriculumProcedureNames,
  translateProcedureName,
} from '@cdo/apps/blockly/utils/localization/procedureNameRegistry';
import localization from '@cdo/apps/localization';

import setBlocklyGlobal from '../../../../util/setupBlocklyGlobal';

setBlocklyGlobal();

function toolbox(xml: string) {
  return BlocklyCore.utils.toolbox.convertToolboxDefToJson(xml);
}

const flush = () => new Promise(resolve => queueMicrotask(() => resolve(0)));

describe('setCurriculumProcedureNames', () => {
  beforeEach(() => {
    setCurriculumProcedureNames({});
  });

  it('reads definitions from XML start blocks', () => {
    setCurriculumProcedureNames({
      startBlocks:
        '<xml><block type="procedures_defnoreturn">' +
        '<field name="NAME">jump</field></block></xml>',
    });
    expect(isTranslatable('jump')).toBe(true);
  });

  it('reads definitions from JSON start blocks', () => {
    setCurriculumProcedureNames({
      startBlocks: JSON.stringify({
        blocks: {
          blocks: [
            {
              type: 'behavior_definition',
              extraState: {procedureId: 'p1', behaviorId: 'wandering'},
            },
          ],
        },
        procedures: [{id: 'p1', name: 'wandering'}],
      }),
    });
    expect(isTranslatable('wandering')).toBe(true);
  });

  it('reads callers from a toolbox category never opened', () => {
    setCurriculumProcedureNames({
      toolbox: toolbox(
        '<xml>' +
          '<category name="Events"><block type="when_run"></block></category>' +
          '<category name="Behaviors">' +
          '<block type="gamelab_behavior_get"><field name="NAME">spinning</field></block>' +
          '<block type="gamelab_behavior_get"><title name="VAR">shrinking</title></block>' +
          '</category>' +
          '<category name="Functions">' +
          '<block type="procedures_callnoreturn"><mutation name="draw a flower"></mutation></block>' +
          '</category>' +
          '</xml>'
      ),
    });
    expect(isTranslatable('spinning')).toBe(true);
    expect(isTranslatable('shrinking')).toBe(true);
    expect(isTranslatable('draw a flower')).toBe(true);
  });

  it('reads callers nested inside a toolbox block', () => {
    setCurriculumProcedureNames({
      toolbox: toolbox(
        '<xml><block type="gamelab_addBehaviorSimple">' +
          '<value name="BEHAVIOR"><block type="gamelab_behavior_get">' +
          '<field name="NAME">swimming</field></block></value>' +
          '</block></xml>'
      ),
    });
    expect(isTranslatable('swimming')).toBe(true);
  });

  it('reads callers from a JSON toolbox', () => {
    setCurriculumProcedureNames({
      toolbox: {
        kind: 'categoryToolbox',
        contents: [
          {
            kind: 'category',
            name: 'Functions',
            contents: [
              {
                kind: 'block',
                type: 'procedures_callnoreturn',
                extraState: {name: 'jump twice'},
              },
              {
                kind: 'block',
                type: 'gamelab_addBehaviorSimple',
                inputs: {
                  BEHAVIOR: {
                    block: {
                      type: 'gamelab_behavior_get',
                      fields: {NAME: 'hop'},
                    },
                  },
                },
              },
            ],
          },
        ],
      },
    });
    expect(isTranslatable('jump twice')).toBe(true);
    expect(isTranslatable('hop')).toBe(true);
  });

  it('ignores names that are not procedures', () => {
    setCurriculumProcedureNames({
      toolbox: toolbox(
        '<xml><block type="text"><field name="NAME">hello</field></block></xml>'
      ),
    });
    expect(isTranslatable('hello')).toBe(false);
  });

  it('drops the previous level names', () => {
    setCurriculumProcedureNames({
      toolbox: toolbox(
        '<xml><block type="procedures_callnoreturn"><mutation name="old"></mutation></block></xml>'
      ),
    });
    setCurriculumProcedureNames({
      toolbox: toolbox(
        '<xml><block type="procedures_callnoreturn"><mutation name="new"></mutation></block></xml>'
      ),
    });
    expect(isTranslatable('old')).toBe(false);
    expect(isTranslatable('new')).toBe(true);
  });

  it('still reads the toolbox when the start blocks are unreadable', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    setCurriculumProcedureNames({
      startBlocks: '<xml><block type="procedures_defnoreturn">',
      toolbox: toolbox(
        '<xml><block type="procedures_callnoreturn"><mutation name="ok"></mutation></block></xml>'
      ),
    });
    expect(isTranslatable('ok')).toBe(true);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('notifies once per change and not when the names are the same', async () => {
    const listener = jest.fn();
    const unsubscribe = onRegistryChange(listener);
    const sources = {
      toolbox: toolbox(
        '<xml><block type="procedures_callnoreturn"><mutation name="a"></mutation></block>' +
          '<block type="procedures_callnoreturn"><mutation name="b"></mutation></block></xml>'
      ),
    };
    setCurriculumProcedureNames(sources);
    await flush();
    expect(listener).toHaveBeenCalledTimes(1);

    setCurriculumProcedureNames(sources);
    await flush();
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});

describe('translateProcedureName', () => {
  const translations: {[source: string]: string} = {
    jump: 'saltar',
    '[behavior] jump': '[behavior] brincando',
    '[behavior] spin': 'girando',
  };

  beforeEach(() => {
    jest
      .spyOn(localization, 'translate')
      .mockImplementation(
        (text: unknown) => (translations[text as string] ?? text) as never
      );
    setCurriculumProcedureNames({
      toolbox: {
        kind: 'flyoutToolbox',
        contents: ['jump', 'spin'].map(name => ({
          kind: 'block',
          type: 'procedures_callnoreturn',
          extraState: {name},
        })),
      },
    });
  });

  afterEach(() => {
    setCurriculumProcedureNames({});
    jest.restoreAllMocks();
  });

  it('translates a procedure name', () => {
    expect(translateProcedureName('jump', false)).toBe('saltar');
  });

  it('translates a behavior name through its own entry', () => {
    expect(translateProcedureName('jump', true)).toBe('brincando');
  });

  it('trusts a behavior translation that dropped the prefix', () => {
    expect(translateProcedureName('spin', true)).toBe('girando');
  });

  it('leaves a name the level did not author alone', () => {
    expect(translateProcedureName('my dance', false)).toBe('my dance');
    expect(localization.translate).not.toHaveBeenCalled();
  });
});
