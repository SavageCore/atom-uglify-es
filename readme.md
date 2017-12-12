[![Build status](https://ci.appveyor.com/api/projects/status/xdl3nffcglveivit/branch/master?svg=true)](https://ci.appveyor.com/project/SavageCore/atom-uglify-es/branch/master) [![Build Status](https://travis-ci.org/SavageCore/atom-uglify-es.svg?branch=master)](https://travis-ci.org/SavageCore/atom-uglify-es)

# atom-uglify-es

> Minify JavaScript with [uglify-es](https://www.npmjs.com/package/uglify-es)

## Install

    $ apm install atom-uglify-es

Or Settings → Install → Search for `atom-uglify-es`

## Usage

* Open the Command Palette, and type `uglify-es`.
* Right click tab, tree-view or editor and click `Minify JavaScript`


Can also minify just a selection. For example the code in a `<script>` tag.

## Keyboard shortcut

Set the keyboard shortcut you want in your [keymap](http://flight-manual.atom.io/using-atom/sections/basic-customization/#customizing-keybindings):

```cson
'atom-workspace':
	'ctrl-alt-m': 'atom-uglify-es:uglify'
```

## License

MIT © [SavageCore](https://savagecore.eu)