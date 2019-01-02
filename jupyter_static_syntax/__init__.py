from ._version import __version__  # noqa

from .serverextension import SyntaxServerExtension


def load_jupyter_server_extension(app):
    (
        SyntaxServerExtension(app)
        .patch_wasm()
        .add_routes()
        .log.warn("jupyter syntax activated")
    )
