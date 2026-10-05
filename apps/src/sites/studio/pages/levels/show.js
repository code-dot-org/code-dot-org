import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';

import AiDiffFloatingActionButton from '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton';
import {setHostedDrawerConfig} from '@cdo/apps/aiTeacherDrawer/redux';
import ScriptLevelRedirectDialog from '@cdo/apps/code-studio/components/ScriptLevelRedirectDialog';
import ShareLogo from '@cdo/apps/code-studio/components/shareLogo/ShareLogo';
import {setIsMiniView} from '@cdo/apps/code-studio/progressRedux';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore, registerReducers} from '@cdo/apps/redux';
import instructions, {
  setTtsAutoplayEnabledForLevel,
  setCodeReviewEnabledForLevel,
  setTaRubric,
} from '@cdo/apps/redux/instructions';
import ScrapbookButton from '@cdo/apps/scrapbook/ScrapbookButton';
import RubricFloatingActionButton from '@cdo/apps/templates/rubrics/RubricFloatingActionButton';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import experiments from '@cdo/apps/util/experiments';
import getScriptData, {hasScriptData} from '@cdo/apps/util/getScriptData';
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-level]');
  const config = JSON.parse(script.dataset.level);

  registerReducers({instructions});

  // this is the common js entry point for level pages
  // which is why ttsAutoplay is set here
  const ttsAutoplayEnabled = config.tts_autoplay_enabled;
  getStore().dispatch(setTtsAutoplayEnabledForLevel(ttsAutoplayEnabled));
  const codeReviewEnabled = config.code_review_enabled;
  getStore().dispatch(setCodeReviewEnabledForLevel(codeReviewEnabled));

  // If viewing the unit overview components on the level page it is in
  // the mini view
  getStore().dispatch(setIsMiniView(true));

  // The share-page logo mount node is present only on share views
  // (gated server-side by view_options[:code_studio_logo]).
  const mainLogoMountPoint = document.getElementById('main-logo');
  if (mainLogoMountPoint) {
    createReactRoot(
      <ShareLogo logoUrl={mainLogoMountPoint.dataset.logoUrl} />,
      mainLogoMountPoint
    );
  }

  const redirectDialogMountPoint = document.getElementById('redirect-dialog');
  if (redirectDialogMountPoint && config.redirect_script_url) {
    createReactRoot(
      <ScriptLevelRedirectDialog
        redirectUrl={config.redirect_script_url}
        scriptName={config.script_name}
        courseName={config.course_name}
      />,
      redirectDialogMountPoint,
      {
        legacyReactDomRender: true,
      }
    );
  }

  const aiDiffLevelContext = () => {
    const context = {type: AiDiffContext.LEVEL};
    if (hasScriptData('script[data-aiDiffData]')) {
      const {levelId, scriptId} = getScriptData('aiDiffData');
      context.levelId = levelId;
      context.unitId = scriptId;
    }
    return context;
  };

  /**
   * Put the TA drawer on the page. Which gating applies is the caller's
   * business; what differs here is who renders it. A Lab2 level lays the
   * drawer out inside the lab's own component tree, so that the lab sizes its
   * panels around the drawer rather than being told to leave room for it —
   * there we hand the configuration to Lab2Wrapper. Every other level mounts
   * it over the page as before.
   *
   * The question is whether a Lab2Wrapper exists to host the drawer, which is
   * narrower than whether the level uses Lab2: levels/show.html.haml renders
   * #lab2-container only in the branch that reaches it, so a level with
   * uses_lab2? true still has no lab on a summary view (?view=summary) or in a
   * locked or hidden lesson. Handing the drawer to a wrapper that never mounts
   * would leave those pages with no drawer at all, so test for the container.
   */
  const showAiDiffDrawer = (mountPoint, props) => {
    if (document.getElementById('lab2-container')) {
      getStore().dispatch(setHostedDrawerConfig(props));
      return;
    }
    createReactRoot(
      <Provider store={getStore()}>
        <AiDiffFloatingActionButton {...props} />
      </Provider>,
      mountPoint,
      {
        legacyReactDomRender: true,
      }
    );
  };

  // AI Differentiation FAB to be shown only if rubric FAB is not. Eligibility
  // is decided server-side: the mount point exists only for eligible users.
  const renderAiDiffButton = ({hideButton = false} = {}) => {
    const aiDiffFabMountPoint = document.getElementById(
      'ai-differentiation-fab-mount-point'
    );
    if (!aiDiffFabMountPoint || !experiments.isEnabled('ai-diff-levels')) {
      return;
    }
    showAiDiffDrawer(aiDiffFabMountPoint, {
      context: aiDiffLevelContext(),
      scriptName: config.script_name,
      hideButton,
      canStartOpen: false,
      canDefaultOpen: false,
    });
  };

  const scrapbookMountPoint = document.getElementById(
    'scrapbook-button-mount-point'
  );
  if (scrapbookMountPoint) {
    createReactRoot(
      <Provider store={getStore()}>
        <ScrapbookButton />
      </Provider>,
      scrapbookMountPoint,
      {
        legacyReactDomRender: true,
      }
    );
  }

  if (hasScriptData('script[data-rubricdata]')) {
    const rubricData = getScriptData('rubricdata');
    const {
      rubric,
      studentLevelInfo,
      canShowTaScoresAlert,
      parentLevelName,
      levelType,
    } = rubricData;

    const reportingData = {
      unitName: config.script_name,
      courseName: config.course_name,
      levelName: config.level_name,
    };
    getStore().dispatch(setTaRubric(rubric));

    const rubricFabMountPoint = document.getElementById(
      'rubric-fab-mount-point'
    );
    if (rubricFabMountPoint) {
      //rubric fab mount point is only true for teachers
      if (
        !!rubric &&
        rubric.learningGoals.some(lg => lg.aiEnabled) &&
        config.level_name === rubric.level.name
      ) {
        analyticsReporter.sendEvent(EVENTS.TA_RUBRIC_AI_PAGE_VISITED, {
          ...reportingData,
          studentId: !!studentLevelInfo ? studentLevelInfo.user_id : '',
        });
      }
      if (experiments.isEnabled('rubrics-drawer')) {
        // Same trigger position as the rubric FAB below, but it hands off
        // to the AI TA drawer's Rubrics screen (apps/src/aiTeacherDrawer/
        // rubrics/) instead of the floating RubricContainer panel.
        showAiDiffDrawer(rubricFabMountPoint, {
          context: aiDiffLevelContext(),
          scriptName: reportingData.unitName,
          openToNav: 'Rubrics',
        });
      } else {
        createReactRoot(
          <Provider store={getStore()}>
            <RubricFloatingActionButton
              rubric={rubric}
              studentLevelInfo={studentLevelInfo}
              reportingData={reportingData}
              currentLevelName={config.level_name}
              aiEnabled={rubric.learningGoals.some(lg => lg.aiEnabled)}
              parentLevelName={parentLevelName}
              canShowTaScoresAlert={canShowTaScoresAlert}
              levelType={levelType}
            />
          </Provider>,
          rubricFabMountPoint,
          {
            legacyReactDomRender: true,
          }
        );
        // The branch above doesn't mount the AI TA drawer (it renders the
        // legacy floating rubric panel instead), so on rubric levels
        // TeacherPanelHandle's "open the drawer to Roster" click would
        // otherwise have no drawer to open. Mount one, same as non-rubric
        // levels, whenever the TA teacher panel experiment is active — but
        // without its own FAB icon, since the teacher panel handle's arrow
        // is the only intended entry point on rubric levels.
        if (experiments.isEnabled('ta-teacher-panel')) {
          renderAiDiffButton({hideButton: true});
        }
      }
    } else {
      renderAiDiffButton();
    }
  } else {
    renderAiDiffButton();
  }
}
