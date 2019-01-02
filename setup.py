import os
from setuptools import setup

name = "jupyter_static_syntax"
__version__ = None


with open(os.path.join(name, "_version.py")) as fp:
    exec(fp.read())


setup_args = dict(
    name=name,
    version=__version__,
    description="Serve TextMate (Atom, VSCode) Syntax Highlighting and support"
    " in Jupyter",
    url="http://github.com/deathbeds/jupyterlab-simple-syntax",
    author="Dead Pixel Collective",
    license="BSD-3-Clause",
    packages=["jupyter_static_syntax"],
    setup_requires=["jupyterlab"],
    zip_safe=False,
)

if __name__ == "__main__":
    setup(**setup_args)
