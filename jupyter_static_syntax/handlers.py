import json

from tornado import gen, web

from notebook.base.handlers import APIHandler


class SyntaxListHandler(APIHandler):
    def initialize(self, manager):
        self.manager = manager

    @web.authenticated
    @gen.coroutine
    def get(self):
        self.finish(
            json.dumps(self.manager.grammars(), indent=2, sort_keys=True))
