from src.rubric_utils.decision import Decision
from src.codeorg_utils.utils import (
    build_move,
    build_nectar,
    build_repeat,
)


class LoopStrategy(Decision):

    def registerChoices(self):

        self.addChoice('loop_strategy', {
            'forward': 0.9,
            'backward': 0.1,
        })

        self.addChoice('loop_firstMoveType', {
            'none': 0.1,
            'loop': 0.5,
            'manual': 0.4
        })

        self.addChoice('loop_firstMoveLoopNum', {
            '1': 1,
            '2': 1,
            '3': 1,
            '4': 1,
            '5': 1,
        })

        self.addChoice('loop_bodyType', {
            'none': 0.1,
            'loop': 0.5,
            'manual': 0.4
        })
        
        self.addChoice('loop_bodyLoopNum', {
            '1': 1,
            '2': 1,
            '3': 1,
            '4': 1,
            '5': 1,
        })

        self.addChoice('loop_bodyDropMove', {
            'True': 0.3,
            'False': 0.7,
        })

        self.addChoice('loop_bodyDropNectar', {
            'True': 0.3,
            'False': 0.7,
        })

        self.addChoice('loop_bodyRandomCodeInLoop', {
            'none': 0.3,
            'move': 0.3,
            'nectar': 0.3,
            'moveNectar': 0.1,
        })

        self.addChoice('loop_bodyRandomCodeAfterLoop', {
            'none': 0.3,
            'move': 0.3,
            'nectar': 0.3,
            'moveNectar': 0.1,
        })

        self.addChoice('manual_loopNum', {
            '1': 1,
            '2': 1,
            '3': 1,
        })

        self.addChoice('manual_randomCode', {
            'none': 0.3,
            'move': 0.3,
            'nectar': 0.3,
            'moveNectar': 0.1,
        })