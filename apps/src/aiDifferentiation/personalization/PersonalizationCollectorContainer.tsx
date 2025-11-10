import Button from '@code-dot-org/component-library/button';
import React from 'react';

import PersonalizationInterstitial from '@cdo/apps/aiDifferentiation/personalization/components/personalizationInterstitial/PersonalizationInterstitial';
import {matchTeachingProfile} from '@cdo/apps/aiEvaluation/aiEvaluationApi';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import i18n from '@cdo/locale';

import {useTeachingProfileData} from './../hooks/useTeachingProfileData';
import {
  NumberOfYearsTeachingAnswer,
  ClassroomVisionAnswer,
  ChallengeAnswer,
  ConfidenceAnswer,
  GoalsAnswer,
  SupportAnswer,
} from './components/PersonalizationAnswers';
import PersonalizationProgressBar from './components/PersonalizationProgressBar';
import PersonalizationQuestion from './components/personalizationQuestion/PersonalizationQuestion';
import {PERSONALIZATION_PROMPTS} from './components/personalizationQuestion/personalizationQuestions';
import PersonalizationResults from './components/personalizationResults/PersonalizationResults';
import {TEACHING_STYLES} from './components/personalizationResults/PersonalizationResultsPersonas';
import {saveTeachingProfileData} from './teachingProfileApi';

import style from './personalization-information.module.scss';

const PersonalizationCollectorContainer: React.FC = () => {
  const [questionsNumber, setQuestionsNumber] = React.useState(0);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showInterstitialState, setShowInterstitialState] =
    React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [matchedTeachingProfile, setMatchedTeachingProfile] = React.useState(
    TEACHING_STYLES[0].name
  );

  const NEXT = 1;
  const BACK = -1;

  const {personalizationData, setPersonalizationData, isLoading} =
    useTeachingProfileData();

  const onCarouselPress = async (direction: number) => {
    if (direction === NEXT) {
      setIsSaving(true);
      try {
        await saveTeachingProfileData(personalizationData);
      } catch (error) {
        console.error('Failed to save teaching profile data:', error);
      } finally {
        setIsSaving(false);
      }
    }

    if (direction === BACK && questionsNumber === 0) {
      setShowInterstitialState(false);
      return;
    }

    if (
      direction === BACK &&
      questionsNumber === PERSONALIZATION_PROMPTS.length - 1
    ) {
      setShowResults(false);
      setShowInterstitialState(false);
    }

    if (
      direction === NEXT &&
      questionsNumber === PERSONALIZATION_PROMPTS.length - 1
    ) {
      if (showResults && showInterstitialState) {
        setShowInterstitialState(false);
        return;
      }
      if (!showInterstitialState) {
        setShowInterstitialState(true);
      }
      if (!isSaving) {
        setIsSaving(true);
        try {
          setShowResults(true);

          await saveTeachingProfileData(personalizationData);
          const profileMatch = await matchTeachingProfile(personalizationData);

          if (profileMatch?.matchingProfile) {
            setMatchedTeachingProfile(profileMatch.matchingProfile);

            const updatedData = {
              ...personalizationData,
              matchedPersona: profileMatch.matchingProfile,
            };
            await saveTeachingProfileData(updatedData);
          }

          analyticsReporter.sendEvent(EVENTS.PERSONALIZATION_PERSONA_MATCHED, {
            persona: profileMatch?.matchingProfile ?? TEACHING_STYLES[0].name,
          });

          setShowResults(true);
        } catch (error) {
          console.error('Error in final step:', error);
          setShowResults(true);
        } finally {
          setIsSaving(false);
        }
      }
      return;
    }
    if (direction === NEXT) {
      analyticsReporter.sendEvent(EVENTS.PERSONALIZATION_ANSWER_SUBMITTED, {
        question: PERSONALIZATION_PROMPTS[questionsNumber].question,
        questionNumber: questionsNumber + 1,
      });
      setIsSaving(true);
      try {
        await saveTeachingProfileData(personalizationData);
      } catch (error) {
        console.error('Failed to save teaching profile data:', error);
      } finally {
        setIsSaving(false);
      }
    }

    if (direction === BACK && questionsNumber === 0) {
      return;
    }
    setQuestionsNumber(questionsNumber + direction);
  };

  const determineAnswerType = React.useCallback(() => {
    const currentQuestion = PERSONALIZATION_PROMPTS[questionsNumber];
    switch (currentQuestion.order) {
      case 1:
        return (
          <NumberOfYearsTeachingAnswer
            yearsTeaching={personalizationData.yearsTeaching ?? 0}
            setYearsTeaching={(years: number) =>
              setPersonalizationData(prev => ({
                ...prev,
                yearsTeaching: years,
                dateYearsTeachingSet: new Date(),
              }))
            }
          />
        );
      case 2:
        return (
          <ConfidenceAnswer
            selectedConfidence={personalizationData.selectedConfidence ?? -1}
            setSelectedConfidence={(confidence: number) =>
              setPersonalizationData(prev => ({
                ...prev,
                selectedConfidence: confidence,
              }))
            }
          />
        );
      case 3:
        return (
          <GoalsAnswer
            selectedGoals={personalizationData.selectedGoals ?? []}
            setSelectedGoals={(goals: string[]) =>
              setPersonalizationData(prev => ({...prev, selectedGoals: goals}))
            }
            otherGoalText={personalizationData.otherGoalText ?? ''}
            setOtherGoalText={(text: string) =>
              setPersonalizationData(prev => ({...prev, otherGoalText: text}))
            }
          />
        );
      case 4:
        return (
          <ClassroomVisionAnswer
            classroomVision={personalizationData.classroomVision ?? ''}
            setClassroomVision={(vision: string) =>
              setPersonalizationData(prev => ({
                ...prev,
                classroomVision: vision,
              }))
            }
          />
        );
      case 5:
        return (
          <SupportAnswer
            selectedSupports={personalizationData.selectedSupports ?? []}
            setSelectedSupports={(supports: string[]) =>
              setPersonalizationData(prev => ({
                ...prev,
                selectedSupports: supports,
              }))
            }
            otherSupportText={personalizationData.otherSupportText ?? ''}
            setOtherSupportText={(text: string) =>
              setPersonalizationData(prev => ({
                ...prev,
                otherSupportText: text,
              }))
            }
          />
        );
      case 6:
        return (
          <ChallengeAnswer
            challenge={personalizationData.challenge ?? ''}
            setChallenge={(challenge: string) =>
              setPersonalizationData(prev => ({
                ...prev,
                challenge: challenge,
              }))
            }
          />
        );
      default:
        return <div>Error: question not found</div>;
    }
  }, [questionsNumber, setPersonalizationData, personalizationData]);

  const findTeachingStyle = (styleName: string) => {
    return TEACHING_STYLES.find(style => style.name === styleName);
  };

  const showProgressBar = !isLoading && (!showResults || showInterstitialState);

  return (
    <>
      {showProgressBar && (
        <PersonalizationProgressBar
          currentQuestionNumber={questionsNumber + 1}
          totalQuestionsNumber={PERSONALIZATION_PROMPTS.length}
        />
      )}

      <div className={style.carouselContainer}>
        {isLoading ? (
          <div>Loading...</div>
        ) : showResults && !showInterstitialState ? (
          <PersonalizationResults
            teachingStyle={
              matchedTeachingProfile
                ? findTeachingStyle(matchedTeachingProfile) ??
                  TEACHING_STYLES[0]
                : TEACHING_STYLES[0]
            }
          />
        ) : (
          <>
            {showInterstitialState || isSaving ? (
              <PersonalizationInterstitial
                currentQuestion={PERSONALIZATION_PROMPTS[questionsNumber]}
                personalizationData={personalizationData}
              />
            ) : (
              <>
                <PersonalizationQuestion questionNumber={questionsNumber} />
                <div className={style.answerContainer}>
                  {determineAnswerType()}
                </div>
              </>
            )}
            <div className={style.navigationButtons}>
              <Button
                id={'back-button'}
                text={i18n.back()}
                type="secondary"
                color="gray"
                size="m"
                onClick={() => onCarouselPress(BACK)}
                iconLeft={{iconName: 'angle-left'}}
              />
              <Button
                id={'next-button'}
                text={isSaving ? i18n.saving() : i18n.next()}
                type="primary"
                size="m"
                onClick={() => onCarouselPress(NEXT)}
                disabled={isSaving}
                iconRight={isSaving ? undefined : {iconName: 'angle-right'}}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PersonalizationCollectorContainer;
