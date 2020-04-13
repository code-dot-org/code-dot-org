from src.rubric_utils.decision import Decision
from src.codeorg_utils.utils import (
    formatOutputFromTokens, 
    toCodeList,
)


class Start(Decision):
    """
    Start is a special decision which is invoked by the Sampler to 
    generate a single sample.
    """

    def registerChoices(self):
        self.addChoice('postprocess_numCalls', {
            '1': 0.85,
            '2': 0.1,
            '3': 0.05,
        })

    def render(self):
        # code = 'Program [ when_run [ {codeInject} ] ]'
        # codeInject = self.expand('Root')
        # code = code.format(codeInject=codeInject)
        code = self.expand('Root')

        codeTokens = toCodeList(code)
        code = formatOutputFromTokens(codeTokens, init_depth=1)
        code = f'Program\n\twhen_run\n{code}'.strip()
        code = code.replace('\t', '  ')

        return code
