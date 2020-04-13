from src.rubric_utils.decision import Decision
from src.codeorg_utils.utils import build_repeat


class Solution(Decision):

    def registerChoices(self):
        self.addChoice('uselessLoop',  {
            'True': 0.05,
            'False': 0.95,
        })

    def updateRubric(self):
        if eval(self.getChoice('uselessLoop')):
            self.turnOnRubric('nit:extra-loop')

    def render(self):
        strategy = self.expand('Strategy')

        if eval(self.getChoice('uselessLoop')):
            code = build_repeat(1, strategy)
        else:
            code = strategy

        return code
