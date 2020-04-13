from src.rubric_utils.decision import Decision


class Start(Decision):
    """
    Start is a special decision which is invoked by the Sampler to 
    generate a single sample.
    """
    def registerChoices(self):
        self.addChoice('start_isEmpty', {
            'True': 0.05,
            'False': 0.95,
        })

    def updateRubric(self):
        if bool(self.getChoice('start_isEmpty')):
            self.turnOnRubric('error:empty')

    def render(self):
        code = """
        Program {{
            when_run {{
                {codeInject}
            }}
        }}
        """

        if bool(self.getChoice('start_isEmpty')):
            codeInject = ''
        else:
            codeInject = self.expand('Solution')

        code = code.format(codeInject=codeInject)

        return code
