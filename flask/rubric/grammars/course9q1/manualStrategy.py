from src.rubric_utils.decision import Decision
from src.codeorg_utils.utils import (
    build_move,
    build_nectar,
    build_repeat,
)


class ManualStrategy(Decision):

    def registerChoices(self):
        self.addChoice('manual_hasNectar', {
            'True': 0.5,
            'False': 0.5,
        })
        self.addChoice('manual_extraCode', {
            'move': 0.1,
            'nectar': 0.05,
            'moveNectar': 0.05,
            'emptyLoop': 0.4,
            'none': 0.4,
        })
        self.addChoice('manual_hasFirstMove', {
            'True': 0.7,
            'False': 0.3,
        })
        self.addChoice('manual_hasLastNectar', {
            'True': 0.7,
            'False': 0.3,
        })
        self.addChoice('manual_numMoves', {
            '1': 0.6,
            '2': 0.2,
            '3': 0.2,
        })

    def updateRubric(self):
        if not eval(self.getChoice('manual_hasNectar')):
            self.turnOnRubric('error:no-nectars')

        if not eval(self.getChoice('manual_hasFirstMove')):
            self.turnOnRubric('error:missing-first-move')

        if not eval(self.getChoice('manual_hasLastNectar')):
            self.turnOnRubric('error:missing-last-nectar')

        if self.getChoice('manual_extraCode') != 'none':
            self.turnOnRubric('error:too-much-code')

    def render(self):

        if eval(self.getChoice('manual_hasNectar')):
            code = []
            if eval(self.getChoice('manual_hasFirstMove')):
                code.append(build_move())

            sub_code = [
                build_move(),
                build_nectar(),
                build_move(),
            ]
            code += sub_code

            if eval(self.getChoice('manual_hasLastNectar')):
                code.append(build_nectar())

        else:
            numMoves = int(self.getChoice('manual_numMoves'))
            code = []
            for i in range(numMoves):
                code.append(build_move())

        extraCode = self.getChoice('manual_extraCode')

        extra_code = []
        if extraCode == 'move':
            extra_code.append(build_move())
        elif extraCode == 'nectar':
            extra_code.append(build_nectar())
        elif extraCode == 'moveNectar':
            extra_code.append(build_move())
            extra_code.append(build_nectar())
        elif extraCode == 'emptyLoop':
            extra_code.append(build_repeat(1, ''))

        code = code + extra_code
        code = '\n'.join(code)

        print(code)

        return code
