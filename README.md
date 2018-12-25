# jupyterlab-simple-syntax

> Simple, customizable syntax highlighting for JupyterLab

## Installation

```bash
# TODO
jupyter labextension install @deatbeds/jupyterlab-simple-syntax
```

## Usage

From a kernel launched with JupyterLab, display a
`application/vnd.jupyter.simplemode.v1+json` JSON object, such as with IPython:

```python
display({"application/vnd.jupyter.simplemode.v1+json": {
    "states": {
      "start": [
        {"regex": ".*", "token": "meta"}
      ]
    }
}}, raw=True)
```

Now, you should be able use the new mode.

A custom kernel could use this at start time to register its own custom syntax.

## Schema

The core of the schema is as defined in the `states` by
[CodeMirror's simplemode](https://codemirror.net/demo/simplemode.html), with
the addition of a few fields and conventions to make most of the features
work with a plain JSON representation.

## Development

```bash
# get jupyterlab and nodejs
jlpm bootstrap
```

## Roadmap

- [ ] Make work with side-effective MIMERenderer in JupyterLab
- [ ] Release on `npm`
- [ ] Make a nice authoring/testing interface
- [ ] Integrate with JupyterLab settings
- [ ] Make a nice visualization
