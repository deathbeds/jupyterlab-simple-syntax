from pathlib import Path
from jupyter_core.paths import jupyter_path

HERE = Path(__file__).parent

SCHEMA_ROOT = HERE / "schema"
SCHEMAS_V1 = SCHEMA_ROOT / "v1"


def syntax_roots():
    return [Path(p) for p in jupyter_path("syntax")] + [HERE / "syntax"]
