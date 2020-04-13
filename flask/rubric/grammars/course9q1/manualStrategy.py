from src.rubric_utils.decision import Decision
from src.codeorg_utils.utils import (
    build_move,
    build_nectar,
    build_repeat,
)


class ManualStrategy(Decision):

    def registerChoice(self):
        self.addChoice('manual_hasNectar', {
            'True': 0.5,
            'False': 0.5,
        })
        self.addChoice('manual_extraCode', {
            'move': 0.075,
            'nectar': 0.075,
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

    def render(self):

        if self.getChoice('manual_hasNector'):
            code = []
            if self.getChoice('manual_hasFirstMove'):
                code.append(build_move())

            sub_code = [
                build_move(),
                build_nectar(),
                build_move(),
            ]
            code += sub_code

            if self.getChoice('manual_hasLastNectar'):
                code.append(build_nectar())

        else:
            numMoves = int(self.getChoice('manual_numMoves'))
            code = []
            for i in range(numMoves):
                code.append(build_move())

        extraCode = self.getChoice('manual_extraCode'):

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

        code = code + extraCode
        code = '\n'.join(code)

        return code
