import mimetypes

from traitlets.config import LoggingConfigurable
from notebook.utils import url_path_join as ujoin
from notebook.base.handlers import FileFindHandler

from .paths import syntax_roots, HERE
from .handlers import SyntaxListHandler
from .manager import SyntaxManager


WASM_MIME = "application/wasm"
EMO = "💰"


class SyntaxServerExtension(LoggingConfigurable):
    def __init__(self, notebookapp):
        super().__init__()
        self._app = notebookapp
        self.manager = SyntaxManager(parent=self)

    def patch_wasm(self):
        _guess = mimetypes.guess_type

        def guess_type(name, strict=True):
            # https://www.iana.org/assignments/provisional-standard-media-types/provisional-standard-media-types.xhtml
            if name[-5:] == ".wasm":
                self.log.warn(f"Saying {name} is some wasm")
                return (WASM_MIME, None)
            return _guess(name, strict)

        mimetypes.guess_type = guess_type

        self.log.warn(f"mimetypes is no longer safe")
        return self

    def add_routes(self):
        app = self._app.web_app
        ns = ujoin(app.settings["base_url"], "/syntax")
        app.add_handlers(
            ".*$",
            [
                (ns + "/", SyntaxListHandler, dict(manager=self.manager)),
                (
                    ujoin(ns, "vendor", "(.*)"),
                    FileFindHandler,
                    dict(path=str(HERE / "vendor")),
                ),
                (
                    ujoin(ns, "(.*)"),
                    FileFindHandler,
                    dict(path=[str(p) for p in syntax_roots()]),
                ),
            ],
        )
        self.log.info(f"syntax paths are available")
        return self
