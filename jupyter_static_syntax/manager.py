import json
from pathlib import Path

from jsonschema import Draft4Validator

from traitlets.config import LoggingConfigurable

from .paths import syntax_roots, SCHEMAS_V1
from .constants import MAGIC_SYNTAX_FILE, TMLANGUAGE, SIMPLEMODE


SCHEMAS = {
    MAGIC_SYNTAX_FILE: SCHEMAS_V1 / "jupyter_syntax.schema.json",
    TMLANGUAGE: SCHEMAS_V1 / "tmlanguage.schema.json",
    SIMPLEMODE: SCHEMAS_V1 / "simplemode.schema.json",
}


class SyntaxManager(LoggingConfigurable):
    _modes = None
    _schemas = None

    def __init__(self, *args, **kwargs):
        super(SyntaxManager, self).__init__(*args, **kwargs)
        self.init_schemas()

    def init_schemas(self):
        self.schemas = {
            key: Draft4Validator(json.loads(value.read_text()))
            for key, value in SCHEMAS.items()
        }

    def parse_manifest(self, manifest, modes):
        self.log.debug(f"parsing {manifest}")
        try:
            parsed = json.loads(manifest.read_text())
        except Exception as err:
            self.log.error(f"Error parsing {manifest}: {err}")
            return

        try:
            self.schemas[MAGIC_SYNTAX_FILE].validate(parsed)
        except Exception as err:
            self.log.error(f"Error validating {manifest}: {err}")
            return

        for name, mode in parsed["modes"].items():
            try:
                self.validate_mode(mode)
                modes[name] = mode
            except Exception as err:
                self.log.error(f"Error validating mode {mode['path']}: {err}")

    def validate_mode(self, mode):
        schema = self.schemas[mode["type"]]

        for root in syntax_roots():
            candidate = Path(root, *mode["path"].split("/"))
            if candidate.exists():
                schema.validate(json.loads(candidate.read_text()))
                return

        raise ValueError(f"""{mode["path"]} not found in any syntax path""")

    def modes(self, force=False):
        if force or self._modes is None:
            modes = {}

            for root in syntax_roots():
                for manifest in sorted(root.rglob(MAGIC_SYNTAX_FILE)):
                    self.parse_manifest(manifest, modes)
            self._modes = modes
        return self._modes
