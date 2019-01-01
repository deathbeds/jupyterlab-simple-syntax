import json
from pathlib import Path

from jsonschema import Draft4Validator

from traitlets.config import LoggingConfigurable

from .paths import syntax_roots, SCHEMAS_V1
from .constants import MAGIC_SYNTAX_FILE, TEXTMATE_LANGUAGES, SIMPLE_MODES


SCHEMAS = {
    MAGIC_SYNTAX_FILE: SCHEMAS_V1 / "jupyter_syntax.schema.json",
    TEXTMATE_LANGUAGES: SCHEMAS_V1 / "tmlanguage.schema.json",
    SIMPLE_MODES: SCHEMAS_V1 / "simplemode.schema.json",
}


class SyntaxManager(LoggingConfigurable):
    _grammars = None
    _schemas = None

    def __init__(self, *args, **kwargs):
        super(SyntaxManager, self).__init__(*args, **kwargs)
        self.init_schemas()

    def init_schemas(self):
        self.schemas = {
            key: Draft4Validator(json.loads(value.read_text()))
            for key, value in SCHEMAS.items()
        }

    def parse_manifest(self, manifest, grammars):
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

        tm_languages = parsed.get(TEXTMATE_LANGUAGES)
        if tm_languages:
            for lang in tm_languages:
                try:
                    self.validate_language(lang["path"], TEXTMATE_LANGUAGES)
                    grammars[TEXTMATE_LANGUAGES].append(lang)
                except Exception as err:
                    self.log.error(
                        f"Error validating language {lang['path']}: {err}")

        # simple_modes = parsed.get(SIMPLE_MODES)
        # grammars[SIMPLE_MODES].extend(simple_modes)

    def validate_language(self, url_frag, lang_type):
        schema = self.schemas[lang_type]

        for root in syntax_roots():
            candidate = Path(root, *url_frag.split("/"))
            if candidate.exists():
                schema.validate(json.loads(candidate.read_text()))
                return

        raise ValueError(f"{url_frag} not found in any syntax path")

    def grammars(self, force=False):
        if force or self._grammars is None:
            grammars = {
                TEXTMATE_LANGUAGES: [],
                SIMPLE_MODES: []
            }

            for root in syntax_roots():
                for manifest in sorted(root.rglob(MAGIC_SYNTAX_FILE)):
                    self.parse_manifest(manifest, grammars)
            self._grammars = grammars
        return self._grammars
