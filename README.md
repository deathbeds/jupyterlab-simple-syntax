# jupyterlab-simple-syntax

> Simple, customizable syntax highlighting for JupyterLab, powered by
> [CodeMirror's simplemode](https://codemirror.net/demo/simplemode.html) JSON
> and [codemirror-atom-modes](https://github.com/patrick-steele-idem/codemirror-atom-modes)

> > This is not meant to be particularly useful yet, but rather is about exploring
> > data-driven ways to capture syntax highlighting.

## Installation

> TODO: Maybe release, but for now try your luck with a
> [development installation](#Development).

## Usage

### As a file

The file type `.simplemode.json` is registered automatically after installing
the extension.

```json
{
  "mime": "example",
  "ext": ["example"],
  "mode": "example",
  "name": "example",
  "states": {
    "start": [{"regex": "\\d+", "token": "number"}]
  }
}
```

Similarly, any TextMate language JSON file (also used by Sublime Text, Atom, or
VSCode) can be loaded.

### As an output

From a kernel launched with JupyterLab, display a
`application/vnd.jupyter.simplemode.v1+json` JSON object, such as with IPython:

```python
display({"application/vnd.jupyter.simplemode.v1+json": {
  "mime": "example",
  "ext": ["example"],
  "mode": "example",
  "name": "example",
    "states": {
      "start": [
        {"regex": ".*", "token": "meta"}
      ]
    }
}}, raw=True)
```

Now, you should be able use the new mode.

While this _could_ be useful for generating little toy syntax highlighters,
a more robust implementation could allow a kernel at startup time to register
its own custom syntax(es).

## How it works

This (ab)uses the Jupyter MIME renderer specification to turn appropriately-
formatted JSON into a syntax highlighting mode.

## Development

```bash
# clone the repo
# get jupyterlab and nodejs
jlpm bootstrap
```

Other things:

```bash
jlpm watch  # continuously rebuild extension
jupyter lab --watch  # continuously rebuild lab in another terminal
```

## Roadmap

- [x] Make work with side-effective MIMERenderer in JupyterLab
- [ ] Add a real schema with ajv
- [ ] Make a nice authoring/testing interface
- [ ] Integrate with JupyterLab settings
- [ ] Make a nice visualization
- [ ] Release on `npm`
