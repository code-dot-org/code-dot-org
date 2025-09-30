import {queryParams} from '@cdo/apps/code-studio/utils';

const thinkingBudgetQueryParam = queryParams('aitutor-thinking-budget');
const thinkingBudgetNumber = Number(thinkingBudgetQueryParam);

export const thinkingBudget = !isNaN(thinkingBudgetNumber)
  ? thinkingBudgetNumber
  : 0;
