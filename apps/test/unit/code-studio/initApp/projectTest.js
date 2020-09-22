import _ from 'lodash';
import {expect, assert} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import {replaceOnWindow, restoreOnWindow} from '../../../util/testUtils';
import * as utils from '@cdo/apps/utils';
import project from '@cdo/apps/code-studio/initApp/project';
import {files as filesApi} from '@cdo/apps/clientApi';
import header from '@cdo/apps/code-studio/header';
import msg from '@cdo/locale';
import {CP_API} from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/PlaygroundConstants';

describe('project.js', () => {
  let sourceHandler;

  const setData = project.__TestInterface.setCurrentData;

  beforeEach(() => {
    sourceHandler = createStubSourceHandler();
    replaceAppOptions();
    sinon.stub(utils, 'reload');
    sinon.stub(header, 'showProjectHeader');
    sinon.stub(header, 'showMinimalProjectHeader');
    sinon.stub(header, 'updateTimestamp');
  });

  afterEach(() => {
    utils.reload.restore();
    header.showProjectHeader.restore();
    header.showMinimalProjectHeader.restore();
    header.updateTimestamp.restore();
    restoreAppOptions();
  });

  describe('getNewProjectName()', () => {
    it('for applab', () => {
      window.appOptions.app = 'applab';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameAppLab()
      );
    });

    it('for gamelab', () => {
      window.appOptions.app = 'gamelab';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameGameLab()
      );
    });

    it('for weblab', () => {
      window.appOptions.app = 'weblab';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameWebLab()
      );
    });

    it('for artist', () => {
      window.appOptions.app = 'turtle';
      window.appOptions.skinId = 'artist';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameArtist()
      );
    });

    it('for artist_zombie', () => {
      window.appOptions.app = 'turtle';
      window.appOptions.skinId = 'artist_zombie';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameArtist()
      );
    });

    it('for anna', () => {
      window.appOptions.app = 'turtle';
      window.appOptions.skinId = 'anna';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameFrozen()
      );
    });

    it('for elsa', () => {
      window.appOptions.app = 'turtle';
      window.appOptions.skinId = 'elsa';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameFrozen()
      );
    });

    it('for Big Game', () => {
      window.appOptions.app = 'studio';
      window.appOptions.level = {useContractEditor: true};
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameBigGame()
      );
    });

    it('for Play Lab', () => {
      window.appOptions.app = 'studio';
      window.appOptions.skinId = 'studio';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNamePlayLab()
      );
    });

    it('for infinity', () => {
      window.appOptions.app = 'studio';
      window.appOptions.skinId = 'infinity';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameInfinity()
      );
    });

    it('for gumball', () => {
      window.appOptions.app = 'studio';
      window.appOptions.skinId = 'gumball';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameGumball()
      );
    });

    it('for iceage', () => {
      window.appOptions.app = 'studio';
      window.appOptions.skinId = 'iceage';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameIceAge()
      );
    });

    it('for Star Wars', () => {
      window.appOptions.app = 'studio';
      window.appOptions.skinId = 'hoc2015';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameStarWars()
      );
    });

    it('for craft', () => {
      window.appOptions.app = 'craft';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameMinecraft()
      );
    });

    it('for flappy', () => {
      window.appOptions.app = 'flappy';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameFlappy()
      );
    });

    it('for bounce', () => {
      window.appOptions.app = 'bounce';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameBounce()
      );
    });

    it('for sports', () => {
      window.appOptions.app = 'bounce';
      window.appOptions.skinId = 'sports';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameSports()
      );
    });

    it('for basketball', () => {
      window.appOptions.app = 'bounce';
      window.appOptions.skinId = 'basketball';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameBasketball()
      );
    });

    it('for dance', () => {
      window.appOptions.app = 'dance';
      expect(project.getNewProjectName()).to.equal(
        msg.defaultProjectNameDance()
      );
    });

    it('default case', () => {
      window.appOptions.app = 'someOtherType';
      expect(project.getNewProjectName()).to.equal(msg.defaultProjectName());
    });
  });

  describe('getStandaloneApp()', () => {
    it('for any level with a predefined project type', () => {
      window.appOptions.level = {projectType: 'foobar'};
      expect(project.getStandaloneApp()).to.equal('foobar');
    });

    it('for applab', () => {
      window.appOptions.app = 'applab';
      expect(project.getStandaloneApp()).to.equal('applab');
    });

    it('for calc', () => {
      window.appOptions.app = 'calc';
      expect(project.getStandaloneApp()).to.equal('calc');
    });

    it('for dance', () => {
      window.appOptions.app = 'dance';
      expect(project.getStandaloneApp()).to.equal('dance');
    });

    it('for eval', () => {
      window.appOptions.app = 'eval';
      expect(project.getStandaloneApp()).to.equal('eval');
    });

    it('for flappy', () => {
      window.appOptions.app = 'flappy';
      expect(project.getStandaloneApp()).to.equal('flappy');
    });

    it('for weblab', () => {
      window.appOptions.app = 'weblab';
      expect(project.getStandaloneApp()).to.equal('weblab');
    });

    it('for gamelab', () => {
      window.appOptions.app = 'gamelab';
      expect(project.getStandaloneApp()).to.equal('gamelab');
    });

    it('for spritelab', () => {
      window.appOptions.app = 'spritelab';
      expect(project.getStandaloneApp()).to.equal('spritelab');
    });

    it('for artist', () => {
      window.appOptions.app = 'turtle';
      expect(project.getStandaloneApp()).to.equal('artist');
    });

    it('for artist_k1', () => {
      window.appOptions.app = 'turtle';
      window.appOptions.level = {isK1: true};
      expect(project.getStandaloneApp()).to.equal('artist_k1');
    });

    it('for frozen', () => {
      window.appOptions.app = 'turtle';
      window.appOptions.skinId = _.sample(['anna', 'elsa']);
      expect(project.getStandaloneApp()).to.equal('frozen');
    });

    it('for minecraft_adventurer', () => {
      window.appOptions.app = 'craft';
      expect(project.getStandaloneApp()).to.equal('minecraft_adventurer');
    });

    it('for minecraft_hero', () => {
      window.appOptions.app = 'craft';
      window.appOptions.level = {isAgentLevel: true};
      expect(project.getStandaloneApp()).to.equal('minecraft_hero');
    });

    it('for minecraft_designer', () => {
      window.appOptions.app = 'craft';
      window.appOptions.level = {isEventLevel: true};
      expect(project.getStandaloneApp()).to.equal('minecraft_designer');
    });

    it('for minecraft_codebuilder', () => {
      window.appOptions.app = 'craft';
      window.appOptions.level = {isConnectionLevel: true};
      expect(project.getStandaloneApp()).to.equal('minecraft_codebuilder');
    });

    it('for playlab', () => {
      window.appOptions.app = 'studio';
      expect(project.getStandaloneApp()).to.equal('playlab');
    });

    it('for playlab_k1', () => {
      window.appOptions.app = 'studio';
      window.appOptions.level = {isK1: true};
      expect(project.getStandaloneApp()).to.equal('playlab_k1');
    });

    it('for algebra_game', () => {
      window.appOptions.app = 'studio';
      window.appOptions.level = {useContractEditor: true};
      expect(project.getStandaloneApp()).to.equal('algebra_game');
    });

    it('for starwars', () => {
      window.appOptions.app = 'studio';
      window.appOptions.skinId = 'hoc2015';
      window.appOptions.droplet = true;
      expect(project.getStandaloneApp()).to.equal('starwars');
    });

    it('for starwarsblocks_hour', () => {
      window.appOptions.app = 'studio';
      window.appOptions.skinId = 'hoc2015';
      window.appOptions.droplet = false;
      expect(project.getStandaloneApp()).to.equal('starwarsblocks_hour');
    });

    it('for iceage', () => {
      window.appOptions.app = 'studio';
      window.appOptions.skinId = 'iceage';
      expect(project.getStandaloneApp()).to.equal('iceage');
    });

    it('for infinity', () => {
      window.appOptions.app = 'studio';
      window.appOptions.skinId = 'infinity';
      expect(project.getStandaloneApp()).to.equal('infinity');
    });

    it('for gumball', () => {
      window.appOptions.app = 'studio';
      window.appOptions.skinId = 'gumball';
      expect(project.getStandaloneApp()).to.equal('gumball');
    });

    it('for bounce', () => {
      window.appOptions.app = 'bounce';
      expect(project.getStandaloneApp()).to.equal('bounce');
    });

    it('for sports', () => {
      window.appOptions.app = 'bounce';
      window.appOptions.skinId = 'sports';
      expect(project.getStandaloneApp()).to.equal('sports');
    });

    it('for basketball', () => {
      window.appOptions.app = 'bounce';
      window.appOptions.skinId = 'basketball';
      expect(project.getStandaloneApp()).to.equal('basketball');
    });

    it('default case', () => {
      window.appOptions.app = 'someothertype';
      expect(project.getStandaloneApp()).to.be.null;
    });
  });

  describe('project.getProjectUrl', function() {
    let stubUrl;
    let url;

    beforeEach(function() {
      stubUrl = sinon.stub(project, 'getUrl').callsFake(() => url);
    });

    afterEach(function() {
      stubUrl.restore();
    });

    it('typical url', function() {
      url = 'http://url';
      expect(project.getProjectUrl('/view')).to.equal('http://url/view');
    });

    it('with ending slashes', function() {
      url = 'http://url//';
      expect(project.getProjectUrl('/view')).to.equal('http://url/view');
    });

    it('with query string', function() {
      url = 'http://url?query';
      expect(project.getProjectUrl('/view')).to.equal('http://url/view?query');
    });

    it('with hash', function() {
      url = 'http://url#hash';
      expect(project.getProjectUrl('/view')).to.equal('http://url/view');
    });

    it('with ending slashes, query, and hash', function() {
      url = 'http://url/?query#hash';
      expect(project.getProjectUrl('/view')).to.equal('http://url/view?query');
    });
  });

  describe('project.getShareUrl', () => {
    let fakeLocation;
    const fakeProjectId = '<project-id>';

    const ORIGINS = [
      {
        studio: 'https://studio.code.org',
        codeProjects: 'https://codeprojects.org'
      },
      {
        studio: 'https://test-studio.code.org',
        codeProjects: 'https://test.codeprojects.org'
      },
      {
        studio: 'https://staging-studio.code.org',
        codeProjects: 'https://staging.codeprojects.org'
      },
      {
        studio: 'http://localhost-studio.code.org:3000',
        codeProjects: 'http://localhost.codeprojects.org:3000'
      }
    ];

    const NORMAL_APP_TYPES = ['artist', 'playlab', 'applab', 'gamelab'];

    const CODEPROJECTS_APP_TYPES = ['weblab'];

    beforeEach(() => {
      sinon.stub(project, 'getLocation').callsFake(() => fakeLocation);
      sinon.stub(project, 'getCurrentId').returns(fakeProjectId);
      sinon.stub(project, 'getStandaloneApp');
    });

    afterEach(() => {
      project.getStandaloneApp.restore();
      project.getCurrentId.restore();
      project.getLocation.restore();
    });

    function setFakeLocation(url) {
      fakeLocation = document.createElement('a');
      fakeLocation.href = url;
    }

    ORIGINS.forEach(({studio: origin, codeProjects: codeProjectsOrigin}) => {
      describe(`on ${origin}`, () => {
        NORMAL_APP_TYPES.forEach(appType => {
          const expected = `${origin}/projects/${appType}/${fakeProjectId}`;
          describe(`${appType} projects share to ${expected}`, () => {
            beforeEach(() => project.getStandaloneApp.returns(appType));

            it(`from project edit page`, () => {
              setFakeLocation(
                `${origin}/projects/${appType}/${fakeProjectId}/edit`
              );
              expect(project.getShareUrl()).to.equal(expected);
            });

            it(`from a script level`, () => {
              setFakeLocation(`${origin}/s/csp3-2019/stage/10/puzzle/4`);
              expect(project.getShareUrl()).to.equal(expected);
            });
          });
        });

        CODEPROJECTS_APP_TYPES.forEach(appType => {
          const expected = `${codeProjectsOrigin}/${fakeProjectId}`;
          describe(`${appType} projects share to ${expected}`, () => {
            beforeEach(() => project.getStandaloneApp.returns(appType));

            it(`from project edit page`, () => {
              setFakeLocation(
                `${origin}/projects/${appType}/${fakeProjectId}/edit`
              );
              expect(project.getShareUrl()).to.equal(expected);
            });

            it(`from project view page`, () => {
              setFakeLocation(
                `${origin}/projects/${appType}/${fakeProjectId}/view`
              );
              expect(project.getShareUrl()).to.equal(expected);
            });

            it(`from a script level`, () => {
              setFakeLocation(`${origin}/s/csp3-2019/stage/10/puzzle/4`);
              expect(project.getShareUrl()).to.equal(expected);
            });
          });
        });
      });
    });
  });

  describe('setLibrarySharedClasses()', () => {
    it('updates the list of shared classes', () => {
      let oldClassList = [1];
      let newClassList = [2];
      setData({sharedWith: oldClassList});
      sinon.stub(project, 'updateChannels_');

      expect(project.getCurrentLibrarySharedClasses()).to.equal(oldClassList);
      project.setLibrarySharedClasses(newClassList);
      expect(project.getCurrentLibrarySharedClasses()).to.equal(newClassList);

      setData({});
      project.updateChannels_.restore();
    });

    it('does nothing if the classes passed are not in an array', () => {
      let oldClassList = [1];
      setData({sharedWith: oldClassList});
      sinon.stub(project, 'updateChannels_');

      expect(project.getCurrentLibrarySharedClasses()).to.equal(oldClassList);
      project.setLibrarySharedClasses(2);
      expect(project.getCurrentLibrarySharedClasses()).to.equal(oldClassList);

      setData({});
      project.updateChannels_.restore();
    });
  });

  describe('setLibraryDetails()', () => {
    beforeEach(() => {
      sinon.stub(project, 'updateChannels_');
    });

    afterEach(() => {
      project.updateChannels_.restore();
      setData({});
    });

    it('updates current library name if libraryName provided', () => {
      let oldName = 'initialLibrary';
      let newName = 'newLibraryName';
      setData({libraryName: oldName});
      expect(project.getCurrentLibraryName()).to.equal(oldName);

      project.setLibraryDetails({libraryName: newName});

      expect(project.getCurrentLibraryName()).to.equal(newName);
      expect(project.updateChannels_).to.have.been.called;
    });

    it('updates current library description if libraryDescription provided', () => {
      let oldDescription = 'initialDescription';
      let newDescription = 'newLibraryDescription';
      setData({libraryDescription: oldDescription});
      expect(project.getCurrentLibraryDescription()).to.equal(oldDescription);

      project.setLibraryDetails({libraryDescription: newDescription});

      expect(project.getCurrentLibraryDescription()).to.equal(newDescription);
      expect(project.updateChannels_).to.have.been.called;
    });

    it('updates current latestLibraryVersion if latestLibraryVersion provided', () => {
      let oldVersion = '123456';
      let newVersion = '654321';
      setData({latestLibraryVersion: oldVersion});
      let currentProject = project.__TestInterface.getCurrent();
      expect(currentProject.latestLibraryVersion).to.equal(oldVersion);

      project.setLibraryDetails({latestLibraryVersion: newVersion});

      currentProject = project.__TestInterface.getCurrent();
      expect(currentProject.latestLibraryVersion).to.equal(newVersion);

      project.setLibraryDetails({latestLibraryVersion: -1});

      currentProject = project.__TestInterface.getCurrent();
      expect(currentProject.latestLibraryVersion).to.be.null;
    });

    it('updates current publishLibrary if publishing is true', () => {
      setData({publishLibrary: false});
      let currentProject = project.__TestInterface.getCurrent();
      expect(currentProject.publishLibrary).to.be.false;

      project.setLibraryDetails({publishing: true});

      currentProject = project.__TestInterface.getCurrent();
      expect(currentProject.publishLibrary).to.be.true;
    });

    it('nullifies current libraryPublishedAt if publishing is false', () => {
      const oldPublishedAt = new Date();
      setData({libraryPublishedAt: oldPublishedAt});
      let currentProject = project.__TestInterface.getCurrent();
      expect(currentProject.libraryPublishedAt).to.equal(oldPublishedAt);

      project.setLibraryDetails({publishing: false});

      currentProject = project.__TestInterface.getCurrent();
      expect(currentProject.libraryPublishedAt).to.be.null;
    });

    it('does not overwrite current with undefined/missing config properties', () => {
      const lib = {
        libraryName: 'my name',
        libraryDescription: 'my description',
        latestLibraryVersion: '123456',
        libraryPublishedAt: new Date()
      };
      setData(lib);
      let currentProject = project.__TestInterface.getCurrent();
      assert.deepEqual(currentProject, lib);

      project.setLibraryDetails({
        libraryDescription: 'new description',
        latestLibraryVersion: undefined
      });

      currentProject = project.__TestInterface.getCurrent();
      expect(currentProject.libraryName).to.equal(lib.libraryName);
      expect(currentProject.libraryDescription).to.equal('new description');
      expect(currentProject.latestLibraryVersion).to.equal(
        lib.latestLibraryVersion
      );
      expect(currentProject.libraryPublishedAt).to.equal(
        lib.libraryPublishedAt
      );
    });
  });

  describe('setProjectLibraries()', () => {
    beforeEach(() => {
      sinon
        .stub(project, 'saveSourceAndHtml_')
        .callsFake((source, callback) => {
          callback();
        });
    });

    afterEach(() => {
      project.saveSourceAndHtml_.restore();
    });

    it('performs a save with the new library list', () => {
      let library = ['test'];
      sourceHandler.getLibrariesList.returns(undefined);
      project.init(sourceHandler);
      return project.setProjectLibraries(library).then(() => {
        expect(project.saveSourceAndHtml_).to.have.been.called;
        expect(
          project.saveSourceAndHtml_.getCall(0).args[0].libraries
        ).to.equal(library);
      });
    });

    it('performs a save with no libraries if an empty array is passed', () => {
      let library = ['test'];
      let result = [];
      project.init(sourceHandler);
      return project.setProjectLibraries(library).then(() => {
        expect(
          project.saveSourceAndHtml_.getCall(0).args[0].libraries
        ).to.equal(library);
        return project.setProjectLibraries(result).then(() => {
          expect(
            project.saveSourceAndHtml_.getCall(1).args[0].libraries
          ).to.equal(result);
        });
      });
    });
  });

  describe('setMakerEnabled()', () => {
    beforeEach(() => {
      sinon
        .stub(project, 'saveSourceAndHtml_')
        .callsFake((source, callback) => {
          callback();
        });
    });

    afterEach(() => {
      project.saveSourceAndHtml_.restore();
    });

    it('performs a save with maker set to circuitPlayground enabled if it was disabled', () => {
      sourceHandler.getMakerAPIsEnabled.returns(false);
      project.init(sourceHandler);
      return project.setMakerEnabled(CP_API).then(() => {
        expect(project.saveSourceAndHtml_).to.have.been.called;
        expect(
          project.saveSourceAndHtml_.getCall(0).args[0].makerAPIsEnabled
        ).to.equal(CP_API);
      });
    });

    it('performs a save with maker disabled if it was enabled', () => {
      sourceHandler.getMakerAPIsEnabled.returns(true);
      project.init(sourceHandler);
      return project.setMakerEnabled(null).then(() => {
        expect(project.saveSourceAndHtml_).to.have.been.called;
        expect(project.saveSourceAndHtml_.getCall(0).args[0].makerAPIsEnabled)
          .to.be.null;
      });
    });

    it('always results in a page reload', () => {
      project.init(sourceHandler);
      expect(utils.reload).not.to.have.been.called;
      return project.setMakerEnabled(null).then(() => {
        expect(utils.reload).to.have.been.called;
      });
    });
  });

  describe('selectedSong()', () => {
    beforeEach(() => {
      project.init(sourceHandler);
    });

    it('saves selected song', () => {
      return project.saveSelectedSong('peas').then(() => {
        expect(sourceHandler.setSelectedSong).to.have.been.called;
      });
    });
  });

  describe('copy() (client-side remix)', () => {
    let server;

    beforeEach(() => {
      sinon.stub(project, 'getStandaloneApp').returns('artist');
      server = sinon.createFakeServer({autoRespond: true});
      project.init(sourceHandler);
    });

    afterEach(() => {
      server.restore();
      project.getStandaloneApp.restore();
    });

    it('performs a client-side remix', async () => {
      stubPostChannels(server);
      stubPutMainJson(server);
      await project.copy('Remixed project');
    });

    it('does not pass currentVersion and replace params on remix', async () => {
      stubPostChannels(server);
      stubPutMainJson(server);
      project.__TestInterface.setCurrentSourceVersionId('fakeid');
      await project.copy('Remixed project');
      expect(server.requests[1].url).to.match(/main.json/);
      expect(server.requests[1].url).not.to.match(/currentVersion=/);
      expect(server.requests[1].url).not.to.match(/replace=(true|false)/);
    });
  });

  describe('load', () => {
    let server;

    beforeEach(() => {
      window.appOptions.channel = 'mychannel';
      sinon.stub(utils, 'currentLocation').returns({
        pathname: '/projects/artist/mychannel',
        search: ''
      });
      sinon.stub(project, 'getStandaloneApp').returns('artist');
      server = sinon.createFakeServer({autoRespond: true});
      project.init(sourceHandler);
    });

    afterEach(() => {
      server.restore();
      project.getStandaloneApp.restore();
      utils.currentLocation.restore();
    });

    describe('standalone project', () => {
      beforeEach(() => {
        sinon.stub(utils, 'navigateToHref');
      });

      afterEach(() => {
        utils.navigateToHref.restore();
      });

      it('succeeds when ajax requests succeed', done => {
        stubGetChannels(server);
        stubGetMainJson(server);
        project.load().then(() => {
          expect(utils.navigateToHref).not.to.have.been.called;
          done();
        });
      });

      it('redirects to new project when channel not found', done => {
        project.load().catch(() => {
          expect(utils.navigateToHref).to.have.been.calledOnce;
          expect(utils.navigateToHref.firstCall.args[0]).to.equal(
            '/projects/artist'
          );
          done();
        });
      });

      it('fails when channels request fails', done => {
        stubGetChannelsWithError(server);
        project.load().catch(() => done());
      });

      it('fails when sources request fails', done => {
        stubGetChannels(server);
        stubGetMainJsonWithError(server);
        project.load().catch(() => done());
      });
    });

    describe('project-backed level', () => {
      beforeEach(() => {
        // This was stubbed at the top level in this file, so unstub it here
        window.appOptions.level.isProjectLevel = false;
      });

      it('succeeds when ajax requests succeed', done => {
        stubGetChannels(server);
        stubGetMainJson(server);
        project.load().then(() => done());
      });

      it('fails when channels request fails', done => {
        stubGetChannelsWithError(server);
        project.load().catch(() => done());
      });

      it('fails when sources request fails', done => {
        stubGetChannels(server);
        stubGetMainJsonWithError(server);
        project.load().catch(() => done());
      });
    });

    describe('no channel', () => {
      it('always succeeds', done => {
        window.appOptions.level.isProjectLevel = false;
        window.appOptions.channel = null;
        project.load().then(done);
      });
    });
  });

  describe('serverSideRemix()', () => {
    let server;

    beforeEach(() => {
      sinon.stub(project, 'getStandaloneApp').returns('dance');
      sinon.stub(project, 'save').returns(Promise.resolve());
      sinon.stub(utils, 'navigateToHref');
      server = sinon.createFakeServer({autoRespond: true});
      project.init(sourceHandler);
    });

    afterEach(() => {
      server.restore();
      utils.navigateToHref.restore();
      project.save.restore();
      project.getStandaloneApp.restore();
    });

    it('navigates to server-side remix', async () => {
      project.getStandaloneApp.returns('dance');
      setData({});

      await project.serverSideRemix();

      expect(utils.navigateToHref).to.have.been.calledOnce;
      expect(utils.navigateToHref.firstCall.args[0]).to.match(
        /projects\/dance\/.*\/remix/
      );
    });

    it('saves first if you are the project owner', async () => {
      setData({isOwner: true});

      await project.serverSideRemix();

      expect(project.save).to.have.been.calledOnce;
      expect(project.save.firstCall.args).to.deep.equal([false, true]);
    });

    it('does not save if you are not the project owner', async () => {
      setData({isOwner: false});

      await project.serverSideRemix();

      expect(project.save).not.to.have.been.called;
    });

    it("sets a default project name if it doesn't have one", async () => {
      setData({name: undefined});

      await project.serverSideRemix();

      expect(project.getCurrentName()).to.equal('My Project');
    });

    it('sets a special default project name for Big Game', async () => {
      project.getStandaloneApp.returns('algebra_game');
      setData({name: undefined});

      await project.serverSideRemix();

      expect(project.getCurrentName()).to.equal('Big Game Template');
    });

    it('does not change the name if the project already has one', async () => {
      setData({name: 'Existing name'});

      await project.serverSideRemix();

      expect(project.getCurrentName()).to.equal('Existing name');
    });
  });

  describe('project.saveThumbnail', () => {
    const STUB_CHANNEL_ID = 'STUB-CHANNEL-ID';
    const STUB_BLOB = 'stub-binary-data';

    beforeEach(() => {
      sinon.stub(filesApi, 'putFile');

      const projectData = {
        id: STUB_CHANNEL_ID,
        isOwner: true
      };
      project.updateCurrentData_(null, projectData);
    });

    afterEach(() => {
      project.updateCurrentData_(null, undefined);

      filesApi.putFile.restore();
    });

    it('calls filesApi.putFile with correct parameters', () => {
      project.saveThumbnail(STUB_BLOB);

      expect(filesApi.putFile).to.have.been.calledOnce;
      const call = filesApi.putFile.getCall(0);
      expect(call.args[0]).to.equal('.metadata/thumbnail.png');
      expect(call.args[1]).to.equal(STUB_BLOB);
    });

    it('succeeds if filesApi.putFile succeeds', done => {
      filesApi.putFile.callsFake((path, blob, success, error) => success());

      project.saveThumbnail(STUB_BLOB).then(done);
    });

    it('fails if pngBlob is not provided', done => {
      setData({});

      const promise = project.saveThumbnail(undefined);
      promise.catch(e => {
        expect(e).to.contain('PNG blob required.');
        expect(filesApi.putFile).not.to.have.been.called;
        done();
      });
    });

    it('fails if project is not initialized', done => {
      setData(undefined);

      const promise = project.saveThumbnail(STUB_BLOB);
      promise.catch(e => {
        expect(e).to.contain('Project not initialized');
        expect(filesApi.putFile).not.to.have.been.called;
        done();
      });
    });

    it('fails if project is not owned by the current user', done => {
      setData({});

      project.saveThumbnail(STUB_BLOB).catch(e => {
        expect(e).to.contain('Project not owned by current user');
        expect(filesApi.putFile).not.to.have.been.called;
        done();
      });
    });

    it('fails if filesApi.putFile fails', done => {
      filesApi.putFile.callsFake((path, blob, success, error) => error('foo'));

      project.saveThumbnail(STUB_BLOB).catch(e => {
        expect(e).to.contain('foo');
        done();
      });
    });
  });
});

function replaceAppOptions() {
  replaceOnWindow('appOptions', {
    level: {
      isProjectLevel: true
    }
  });
}

function restoreAppOptions() {
  restoreOnWindow('appOptions');
}

function stubGetChannelsWithError(server) {
  server.respondWith('GET', /\/v3\/channels\/.*/, xhr => {
    xhr.error();
  });
}

function stubGetChannels(server) {
  server.respondWith('GET', /\/v3\/channels\/.*/, xhr => {
    xhr.respond(
      200,
      {
        'Content-Type': 'application/json'
      },
      JSON.stringify({
        createdAt: '2018-10-22T21:59:43.000-07:00',
        updatedAt: '2018-10-22T21:59:45.000-07:00',
        isOwner: true,
        publishedAt: null,
        level: '/projects/artist',
        migratedToS3: true,
        name: 'artist project',
        id: 'kmz3weHzTpZTbRWrHRzMJA',
        projectType: 'artist'
      })
    );
  });
}

function stubPostChannels(server) {
  server.respondWith('POST', /\/v3\/channels/, xhr => {
    xhr.respond(
      200,
      {
        'Content-Type': 'application/json'
      },
      JSON.stringify({
        createdAt: '2018-10-22T21:59:43.000-07:00',
        updatedAt: '2018-10-22T21:59:45.000-07:00',
        isOwner: true,
        publishedAt: null,
        level: '/projects/artist',
        migratedToS3: true,
        name: 'Remix: allthethings-artist-project-backed',
        id: 'kmz3weHzTpZTbRWrHRzMJA',
        projectType: 'artist'
      })
    );
  });
}

function stubGetMainJson(server) {
  server.respondWith('GET', /\/v3\/sources\/.*\/main\.json/, xhr => {
    xhr.respond(
      200,
      {
        'Content-Type': 'application/json'
      },
      JSON.stringify({
        filename: 'main.json',
        category: 'json',
        size: 0,
        versionId: 12345,
        timestamp: Date.now()
      })
    );
  });
}

function stubGetMainJsonWithError(server) {
  server.respondWith('GET', /\/v3\/sources\/.*\/main\.json/, xhr =>
    xhr.error()
  );
}

function stubPutMainJson(server) {
  server.respondWith('PUT', /\/v3\/sources\/.*\/main\.json/, xhr => {
    xhr.respond(
      200,
      {
        'Content-Type': 'application/json'
      },
      JSON.stringify({
        filename: 'main.json',
        category: 'json',
        size: 0,
        versionId: 12345,
        timestamp: Date.now()
      })
    );
  });
}

function createStubSourceHandler() {
  return {
    setInitialLevelHtml: sinon.stub(),
    getLevelHtml: sinon.stub(),
    setInitialLevelSource: sinon.stub(),
    getLevelSource: sinon.stub().resolves(),
    setInitialAnimationList: sinon.stub(),
    getAnimationList: sinon.stub().callsFake(cb => cb({})),
    setInitialGeneratedProperties: sinon.stub(),
    getGeneratedProperties: sinon.stub(),
    setMakerAPIsEnabled: sinon.stub(),
    getMakerAPIsEnabled: sinon.stub(),
    setSelectedSong: sinon.stub(),
    getSelectedSong: sinon.stub(),
    prepareForRemix: sinon.stub().returns(Promise.resolve()),
    setInitialLibrariesList: sinon.stub(),
    getLibrariesList: sinon.stub()
  };
}
