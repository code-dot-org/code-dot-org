import Button from '@code-dot-org/component-library/button';
import React from 'react';

import {matchTeachingProfile} from '@cdo/apps/aiEvaluation/aiEvaluationApi';
import i18n from '@cdo/locale';

import {
  NumberOfYearsTeachingAnswer,
  ClassroomVisionAnswer,
  ChallengeAnswer,
  ConfidenceAnswer,
  GoalsAnswer,
  SupportAnswer,
} from './PersonalizationAnswers';
import PersonalizationQuestion from './PersonalizationQuestion';
import {PERSONALIZATION_PROMPTS} from './personalizationQuestions';
import PersonalizationResults from './PersonalizationResults';
import {TEACHING_STYLES} from './PersonalizationResultsPersonas';
import {saveTeachingProfileData} from './teachingProfileApi';

import style from './personalization-information.module.scss';

interface PersonalizationData {
  selectedGoals: string[];
  selectedSupports: string[];
  otherSupportText: string;
  otherGoalText: string;
  selectedConfidence: number;
  yearsTeaching: number;
  dateYearsTeachingSet: Date | null;
  classroomVision: string;
  challenge: string;
}

const PersonalizationCollectorContainer: React.FC = () => {
  const [questionsNumber, setQuestionsNumber] = React.useState(0);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [personalizationData, setPersonalizationData] = React.useState<
    Partial<PersonalizationData>
  >({});
  const [matchedTeachingProfile, setMatchedTeachingProfile] = React.useState(
    TEACHING_STYLES[0].name
  );

  const NEXT = 1;
  const BACK = -1;

  React.useEffect(() => {
    const loadExistingData = async () => {
      try {
        const response = await fetch('/teaching_profile_data', {
          method: 'GET',
          headers: {
            'X-CSRF-Token':
              document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') || '',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.exists && result.data) {
            const existingData = {...result.data};
            if (existingData.dateYearsTeachingSet) {
              existingData.dateYearsTeachingSet = new Date(
                existingData.dateYearsTeachingSet
              );
            }
            setPersonalizationData(existingData);
          }
        }
      } catch (error) {
        console.error('Failed to load existing teaching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, []);

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
      return;
    }

    if (
      direction === NEXT &&
      questionsNumber === PERSONALIZATION_PROMPTS.length - 1
    ) {
      if (!isSaving) {
        setIsSaving(true);
        try {
          await saveTeachingProfileData(personalizationData);
          const profileMatch = await matchTeachingProfile(personalizationData);

          if (profileMatch?.matchingProfile) {
            setMatchedTeachingProfile(profileMatch.matchingProfile);
          }

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
  }, [questionsNumber, personalizationData]);

  const findTeachingStyle = (styleName: string) => {
    return TEACHING_STYLES.find(style => style.name === styleName);
  };

  return (
    <div className={style.carouselContainer}>
      {isLoading ? (
        <div>Loading...</div>
      ) : showResults ? (
        <PersonalizationResults
          teachingStyle={
            matchedTeachingProfile
              ? findTeachingStyle(matchedTeachingProfile) ?? TEACHING_STYLES[0]
              : TEACHING_STYLES[0]
          }
        />
      ) : (
        <>
          <PersonalizationQuestion questionNumber={questionsNumber} />
          <div className={style.answerContainer}>{determineAnswerType()}</div>

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
  );
};

export default PersonalizationCollectorContainer;
