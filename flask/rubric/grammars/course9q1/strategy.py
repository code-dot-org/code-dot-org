from src.rubric_utils.decision import Decision


class Strategy(Decision):
    
    def registerChoices(self):
        self.addChoice('strategy', {
            'loop': 0.5,
            'manual': 0.5,
        })

    def updateRubric(self):
        choice = self.getChoice('strategy')
        self.turnOnRubric(f'strategy:{choice}')

    def render(self):
        strategy = self.getChoice('strategy')
        if strategy == 'loop':
            code = self.expand('LoopStrategy')
        elif strategy == 'manual':
            code = self.expand('ManualStrategy')
        else: 
            raise Exception(f'Strategy {strategy} not supported.')

        return code
