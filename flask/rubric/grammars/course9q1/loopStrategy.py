from src.rubric_utils.decision import Decision
from src.codeorg_utils.utils import (
    build_move,
    build_nectar,
    build_repeat,
    collapse_commands,
)


class LoopStrategy(Decision):
    # TODO: decompose me into simpler pieces

    def registerChoices(self):

        self.addChoice('loop_strategy', {
            'forward': 0.9,
            'backward': 0.1,
        })

        # --- forward approach choices --- 

        self.addChoice('loop_forwardFirstMoveType', {
            'none': 0.1,
            'loop': 0.5,
            'manual': 0.4
        })

        self.addChoice('loop_forwardFirstMoveLoopNum', {
            '1': 5,
            '2': 2,
            '3': 2,
            '4': 1,
            '5': 1,
        })

        self.addChoice('loop_forwardBodyType', {
            'none': 0.1,
            'loop': 0.5,
            'manual': 0.4
        })
        
        self.addChoice('loop_forwardBodyLoopNum', {
            '1': 2,
            '2': 5,
            '3': 2,
            '4': 1,
            '5': 1,
        })

        self.addChoice('loop_forwardBodyDropMove', {
            'True': 0.3,
            'False': 0.7,
        })

        self.addChoice('loop_forwardBodyDropNectar', {
            'True': 0.3,
            'False': 0.7,
        })

        # --- backward approach choices --- 

        self.addChoice('loop_backwardFirstMoveType', {
            # no option to be "none"
            'loop': 0.6,
            'manual': 0.4,
        })

        self.addChoice('loop_backwardForgetNectar', {
            'True': 0.3,
            'False': 0.7,
        })

        self.addChoice('loop_backwardBodyType', {
            'none': 0.1,
            'loop': 0.5,
            'manual': 0.4
        })

        # --- shared choices between forward/backward approaches ---
        
        self.addChoice('loop_randomCodeInLoop', {
            'none': 0.7,
            'move': 0.1,
            'nectar': 0.1,
            'moveNectar': 0.1,
        })

        self.addChoice('loop_randomCodeOutLoop', {
            'none': 0.5,
            'move': 0.2,
            'nectar': 0.2,
            'moveNectar': 0.1,
        })

    def updateRubric(self):
        loopStrategy = self.getChoice('loop_strategy')
        self.turnOnRubric(f'strategy:loop:{loopStrategy}')
        
        if loopStrategy == 'forward':
            loopNum = int(self.getChoice('loop_forwardFirstMoveLoopNum'))
            if loopNum != 1:
                self.turnOnRubric('error:incorrect-first-move-repeat-num')
            
            loopNum = int(self.getChoice('loop_forwardBodyLoopNum'))
            if loopNum != 2:
                self.turnOnRubric('error:incorrect-body-repeat-num')

            bodyType = self.getChoice('loop_forwardBodyType')
            if bodyType == 'loop':
                dropMove = eval(self.getChoice('loop_forwardBodyDropMove'))
                dropNectar = eval(self.getChoice('loop_forwardBodyDropNectar'))

                if dropMove:
                    self.turnOnRubric('error:forgot-move')

                if dropNectar:
                    self.turnOnRubric('error:forgot-nectar')
                
                randomCode = self.getChoice('loop_randomCodeInLoop')
                if randomCode != 'none':
                    self.turnOnRubric('error:extra-statements-in-loop')

            randomCode = self.getChoice('loop_randomCodeOutLoop')
            if randomCode != 'none':
                self.turnOnRubric('error:extra-statements-out-loop')

        elif loopStrategy == 'backward':
            forgetNectar = eval(self.getChoice('loop_backwardForgetNectar'))
            if forgetNectar:
                self.turnOnRubric('error:forgot-nectar')
            bodyType = self.getChoice('loop_backwardBodyType')
            if bodyType == 'none':
                self.turnOnRubric('error:missing-statements')
            elif bodyType == 'loop':
                randomCode = self.getChoice('loop_randomCodeInLoop')
                if randomCode != 'none':
                    self.turnOnRubric('error:extra-statements-in-loop')
            elif bodyType == 'manual':
                pass
            randomCode = self.getChoice('loop_randomCodeOutLoop')
            if randomCode != 'none':
                self.turnOnRubric('error:extra-statements-out-loop')

    def render(self):
        loopStrategy = self.getChoice('loop_strategy')

        if loopStrategy == 'forward':
            code = []

            # Step 1: choose loop or manual for first Move block
            firstMoveType = self.getChoice('loop_forwardFirstMoveType')
            loopNum = int(self.getChoice('loop_forwardFirstMoveLoopNum'))

            if firstMoveType == 'loop':
                code.append(build_repeat(loopNum, build_move()))
            elif firstMoveType == 'manual':
                code.extend([build_move()] * loopNum)
            elif firstMoveType == 'none':
                pass
            else:
                raise Exception(f'Move type {firstMoveType} not supported.')

            # Step 2: choose body type
            bodyType = self.getChoice('loop_forwardBodyType')
            loopNum = int(self.getChoice('loop_forwardBodyLoopNum'))

            if bodyType == 'loop':
                loopContent = []
                
                dropMove = eval(self.getChoice('loop_forwardBodyDropMove'))
                dropNectar = eval(self.getChoice('loop_forwardBodyDropNectar'))

                if dropMove and dropNectar:
                    loopContent.append(build_repeat(loopNum, ''))
                elif dropMove:
                    loopContent.append(build_repeat(loopNum, build_nectar()))
                elif dropNectar:
                    loopContent.append(build_repeat(loopNum, build_move()))
                else:
                    loopInternal = collapse_commands([build_move(), build_nectar()])
                    loopContent.append(build_repeat(loopNum, loopInternal))

                # possibility of trailing random commands inside loop
                randomCode = self.getChoice('loop_randomCodeInLoop')
                if randomCode == 'none':
                    pass  # do nothing
                elif randomCode == 'move':
                    loopContent.append(build_move())
                elif randomCode == 'nectar':
                    loopContent.append(build_nectar())
                elif randomCode == 'moveNectar':
                    loopContent.append(build_move())
                    loopContent.append(build_nectar())

                loopContent = collapse_commands(loopContent)
                code.append(build_repeat(loopNum, loopContent))

            elif bodyType == 'manual':

                for i in range(loopNum):
                    code.append(build_move(forward=False))
                    code.append(build_nectar())

            elif bodyType == 'none':
                pass

            else:
                raise Exception(f'Body type {bodyType} not supported.')

            # Step 3: choose random commands afterwards
            randomCode = self.getChoice('loop_randomCodeOutLoop')
            if randomCode == 'none':
                pass  # do nothing
            elif randomCode == 'move':
                code.append(build_move())
            elif randomCode == 'nectar':
                code.append(build_nectar())
            elif randomCode == 'moveNectar':
                code.append(build_move())
                code.append(build_nectar())
            else:
                raise Exception(f'Random code type {randomCode} not supported.')

        elif loopStrategy == 'backward':
            code = []
            # Step 1: choose loop or manual for first Move block
            firstMoveType = self.getChoice('loop_backwardFirstMoveType')
            if firstMoveType == 'loop':
                code.append(build_repeat(3, build_move()))
            elif firstMoveType == 'manual':
                code += [build_move(), build_move(), build_move()]
            else:
                raise Exception(f'Move type {firstMoveType} not supported.')
            
            # Step 2: choose if remember nectar
            forgetNectar = eval(self.getChoice('loop_backwardForgetNectar'))
            if not forgetNectar:
                code.append(build_nectar())

            # Step 3: choose type for body
            bodyType = self.getChoice('loop_backwardBodyType')
            if bodyType == 'none':
                pass  # do nothing
            
            elif bodyType == 'loop':
                loopInternal = [
                    build_move(forward=False),
                    build_nectar()
                ]

                # possibility of trailing random commands
                # inside the loop
                randomCode = self.getChoice('loop_randomCodeInLoop')
                if randomCode == 'none':
                    pass  # do nothing
                elif randomCode == 'move':
                    loopInternal.append(build_move())
                elif randomCode == 'nectar':
                    loopInternal.append(build_nectar())
                elif randomCode == 'moveNectar':
                    loopInternal.append(build_move())
                    loopInternal.append(build_nectar())

                loopInternal = collapse_commands(loopInternal)
                code.append(build_repeat(1, loopInternal))

            elif bodyType == 'manual':
                code.append(build_move(forward=False))
                code.append(build_nectar())
            else:
                raise Exception(f'Body type {bodyType} not supported.')

            # Step 4: choose random commands after Loop/Manual
            # TODO: might want to make this more sophisticated
            randomCode = self.getChoice('loop_randomCodeOutLoop')
            if randomCode == 'none':
                pass  # do nothing
            elif randomCode == 'move':
                code.append(build_move())
            elif randomCode == 'nectar':
                code.append(build_nectar())
            elif randomCode == 'moveNectar':
                code.append(build_move())
                code.append(build_nectar())
            else:
                raise Exception(f'Random code type {randomCode} not supported.')

        else:
            raise Exception(f'Loop strategy {loopStrategy} not supported.')

        return '\n'.join(code)