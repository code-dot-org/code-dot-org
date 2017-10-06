import sinon from 'sinon';
import * as testUtils from '../util/testUtils';
import { assert }  from '../util/configuredChai';
import loadScratch from '@cdo/apps/sites/studio/pages/init/loadScratch';
import { __TestInterface } from '@cdo/apps/scratch/scratch';

const project = {
  "targets": [
    {
      "id": "0mMF095Dw^0wcD)pLAV-",
      "name": "Stage",
      "isStage": true,
      "x": 0,
      "y": 0,
      "size": 100,
      "direction": 90,
      "draggable": false,
      "currentCostume": 0,
      "costume": {
        "skinId": 0,
        "name": "backdrop1",
        "bitmapResolution": 1,
        "rotationCenterX": 240,
        "rotationCenterY": 180,
        "assetId": "739b5e2a2435f6e1ec2993791b423146",
        "dataFormat": "png"
      },
      "costumeCount": 1,
      "visible": true,
      "rotationStyle": "all around",
      "blocks": {},
      "variables": {},
      "lists": {},
      "costumes": [
        {
          "skinId": 0,
          "name": "backdrop1",
          "bitmapResolution": 1,
          "rotationCenterX": 240,
          "rotationCenterY": 180,
          "assetId": "739b5e2a2435f6e1ec2993791b423146",
          "dataFormat": "png"
        }
      ],
      "sounds": []
    },
    {
      "id": "HXpns}X18lL;c;x[U6TW",
      "name": "Sprite1",
      "isStage": false,
      "x": 0,
      "y": 0,
      "size": 100,
      "direction": 90,
      "draggable": false,
      "currentCostume": 0,
      "costume": {
        "skinId": 2,
        "name": "costume1",
        "bitmapResolution": 1,
        "rotationCenterX": 47,
        "rotationCenterY": 55,
        "assetId": "09dc888b0b7df19f70d81588ae73420e",
        "dataFormat": "svg"
      },
      "costumeCount": 2,
      "visible": true,
      "rotationStyle": "all around",
      "blocks": {
        "Ms)gl7H3(UZefw-s|~!:": {
          "id": "Ms)gl7H3(UZefw-s|~!:",
          "opcode": "event_whenflagclicked",
          "inputs": {},
          "fields": {},
          "next": "wm:draQ[v^D$dT`Ce:,0",
          "topLevel": true,
          "parent": null,
          "shadow": false,
          "x": 0,
          "y": 0
        },
        "]cr]1_4Y{NMKmYJ.8HI;": {
          "id": "]cr]1_4Y{NMKmYJ.8HI;",
          "opcode": "motion_movesteps",
          "inputs": {
            "STEPS": {
              "name": "STEPS",
              "block": "|ly9aw=0KIJ!(Mm6u/hc",
              "shadow": "|ly9aw=0KIJ!(Mm6u/hc"
            }
          },
          "fields": {},
          "next": "If_.2J}-iuSt7K!N|PG2",
          "topLevel": false,
          "parent": "wm:draQ[v^D$dT`Ce:,0",
          "shadow": false,
          "x": "-321",
          "y": "188"
        },
        "|ly9aw=0KIJ!(Mm6u/hc": {
          "id": "|ly9aw=0KIJ!(Mm6u/hc",
          "opcode": "math_number",
          "inputs": {},
          "fields": {
            "NUM": {
              "name": "NUM",
              "value": "100"
            }
          },
          "next": null,
          "topLevel": false,
          "parent": "]cr]1_4Y{NMKmYJ.8HI;",
          "shadow": true
        },
        "If_.2J}-iuSt7K!N|PG2": {
          "id": "If_.2J}-iuSt7K!N|PG2",
          "opcode": "motion_turnright",
          "inputs": {
            "DEGREES": {
              "name": "DEGREES",
              "block": "1wMyWJPI[6~lS(8L/mfi",
              "shadow": "1wMyWJPI[6~lS(8L/mfi"
            }
          },
          "fields": {},
          "next": "x0d80MJyxL|UNxWoe4DE",
          "topLevel": false,
          "parent": "]cr]1_4Y{NMKmYJ.8HI;",
          "shadow": false,
          "x": "-321",
          "y": "256"
        },
        "1wMyWJPI[6~lS(8L/mfi": {
          "id": "1wMyWJPI[6~lS(8L/mfi",
          "opcode": "math_number",
          "inputs": {},
          "fields": {
            "NUM": {
              "name": "NUM",
              "value": "90"
            }
          },
          "next": null,
          "topLevel": false,
          "parent": "If_.2J}-iuSt7K!N|PG2",
          "shadow": true
        },
        "x0d80MJyxL|UNxWoe4DE": {
          "id": "x0d80MJyxL|UNxWoe4DE",
          "opcode": "motion_movesteps",
          "inputs": {
            "STEPS": {
              "name": "STEPS",
              "block": "2O^|C)=#E.{HQ(V3p1lT",
              "shadow": "2O^|C)=#E.{HQ(V3p1lT"
            }
          },
          "fields": {},
          "next": null,
          "topLevel": false,
          "parent": "If_.2J}-iuSt7K!N|PG2",
          "shadow": false,
          "x": "-321",
          "y": "188"
        },
        "2O^|C)=#E.{HQ(V3p1lT": {
          "id": "2O^|C)=#E.{HQ(V3p1lT",
          "opcode": "math_number",
          "inputs": {},
          "fields": {
            "NUM": {
              "name": "NUM",
              "value": "100"
            }
          },
          "next": null,
          "topLevel": false,
          "parent": "x0d80MJyxL|UNxWoe4DE",
          "shadow": true
        },
        "wm:draQ[v^D$dT`Ce:,0": {
          "id": "wm:draQ[v^D$dT`Ce:,0",
          "opcode": "motion_gotoxy",
          "inputs": {
            "X": {
              "name": "X",
              "block": "o`!K?A*+}=:bh]J`7Y@U",
              "shadow": "o`!K?A*+}=:bh]J`7Y@U"
            },
            "Y": {
              "name": "Y",
              "block": "?SKK4Xgg]vUISyMgC3)q",
              "shadow": "?SKK4Xgg]vUISyMgC3)q"
            }
          },
          "fields": {},
          "next": "]cr]1_4Y{NMKmYJ.8HI;",
          "topLevel": false,
          "parent": "Ms)gl7H3(UZefw-s|~!:",
          "shadow": false,
          "x": "-321",
          "y": "528"
        },
        "o`!K?A*+}=:bh]J`7Y@U": {
          "id": "o`!K?A*+}=:bh]J`7Y@U",
          "opcode": "math_number",
          "inputs": {},
          "fields": {
            "NUM": {
              "name": "NUM",
              "value": "0"
            }
          },
          "next": null,
          "topLevel": false,
          "parent": "wm:draQ[v^D$dT`Ce:,0",
          "shadow": true
        },
        "?SKK4Xgg]vUISyMgC3)q": {
          "id": "?SKK4Xgg]vUISyMgC3)q",
          "opcode": "math_number",
          "inputs": {},
          "fields": {
            "NUM": {
              "name": "NUM",
              "value": "0"
            }
          },
          "next": null,
          "topLevel": false,
          "parent": "wm:draQ[v^D$dT`Ce:,0",
          "shadow": true
        }
      },
      "variables": {},
      "lists": {},
      "costumes": [
        {
          "skinId": 2,
          "name": "costume1",
          "bitmapResolution": 1,
          "rotationCenterX": 47,
          "rotationCenterY": 55,
          "assetId": "09dc888b0b7df19f70d81588ae73420e",
          "dataFormat": "svg"
        },
        {
          "skinId": 1,
          "name": "costume2",
          "bitmapResolution": 1,
          "rotationCenterX": 47,
          "rotationCenterY": 55,
          "assetId": "3696356a03a8d938318876a593572843",
          "dataFormat": "svg"
        }
      ],
      "sounds": []
    }
  ],
  "meta": {
    "semver": "3.0.0"
  }
};

describe('scratch', function () {
  testUtils.setExternalGlobals();
  sinon.stub(console, 'log');

  it('Scratch movement test', function (done) {
    loadScratch({
      containerId: 'app',
      baseUrl: '/base/build/package/',
      app: 'scratch',
      level: {
        scratch: true,
        lastAttempt: JSON.stringify(project),
      },
      onInitialize: () => {
        const vm = __TestInterface.vm;

        assert.equal(vm.runtime.targets[1].x, 0);
        assert.equal(vm.runtime.targets[1].y, 0);
        assert.equal(vm.runtime.targets[1].direction, 90);

        setTimeout(() => {
          document.querySelector('#green-flag').click();

          setTimeout(() => {
            assert.equal(vm.runtime.targets[1].x, 100);
            assert.equal(vm.runtime.targets[1].y, -100);
            assert.equal(vm.runtime.targets[1].direction, 180);

            done();
          }, 100);
        }, 0);
      },
    });
  });
});
