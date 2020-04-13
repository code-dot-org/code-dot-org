from src.rubric_utils.decision import Decision


class Start(Decision):
    """
    Start is a special decision which is invoked by the Sampler to 
    generate a single sample.
    """
    def render(self):
        # code = 'Program [ when_run [ {codeInject} ] ]'
        # codeInject = self.expand('Root')
        # code = code.format(codeInject=codeInject)
        code = self.expand('Root')

        return code
