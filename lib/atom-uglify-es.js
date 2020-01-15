'use babel';

import {CompositeDisposable} from 'atom';

const fs = require('fs');
const uglify = require('uglify-es');

export default {

	config: {
		compress: {
			type: 'boolean',
			default: true
		},
		mangle: {
			type: 'boolean',
			default: true
		},
		uglifyToFile: {
			title: 'Uglify to file',
			type: 'boolean',
			default: false
		},
		onSave: {
			title: 'Uglify on save',
			type: 'boolean',
			default: false
		},
		onSaveIfExists: {
			title: 'Only if minifed file exists',
			type: 'boolean',
			default: false
		}
	},

	subscriptions: null,

	activate() {
		this.subscriptions = new CompositeDisposable();
		const uglifyEs = this;

		this.registerOnSaveSub(uglifyEs);

		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'atom-uglify-es:uglify': {
				hiddenInCommandPalette: false,
				didDispatch() {
					const editor = atom.workspace.getActiveTextEditor();
					uglifyEs.uglify(editor);
				}
			},
			'atom-uglify-es:uglify-tab': {
				hiddenInCommandPalette: true,
				didDispatch() {
					const selectedFile = document.querySelector('.tab-bar .right-clicked .title').getAttribute('data-path');
					atom.workspace.observeTextEditors(editor => {
						if (editor.getPath() === selectedFile) {
							uglifyEs.uglify(editor);
						}
					});
				}
			},
			'atom-uglify-es:uglify-tree': {
				hiddenInCommandPalette: true,
				async didDispatch() {
					let editorFound = false;
					const selectedFile = await this.getSelectedTree();
					const observeEditors = atom.workspace.observeTextEditors(editor => {
						if (editor.getPath() === selectedFile) {
							editorFound = true;
							uglifyEs.uglify(editor);
						}
					});
					observeEditors.dispose();
					if (editorFound === false) {
						atom.workspace.open(selectedFile, {
							activateItem: false
						}).then(editor => {
							uglifyEs.uglify(editor);
						});
					}
				}
			}
		}));
	},

	deactivate() {
		this.subscriptions.dispose();
	},

	uglify(editor) {
		if (!editor || editor.getGrammar().name !== 'JavaScript') {
			return false;
		}
		let selectedText;
		if (typeof editor.getSelectedText() === 'function') {
			selectedText = editor.getSelectedText();
		}
		const text = selectedText || editor.getText();
		const uglifyToFile = atom.config.get('atom-uglify-es.uglifyToFile');
		let result = '';

		try {
			result = uglify.minify(text, {
				compress: atom.config.get('atom-uglify-es.compress'),
				mangle: atom.config.get('atom-uglify-es.mangle')
			}).code;
		} catch (err) {
			console.error(err);
			atom.notifications.addError('atom-uglify-es', {detail: err.message});
			return;
		}

		const cursorPosition = editor.getCursorBufferPosition();
		const line = atom.views.getView(editor).getFirstVisibleScreenRow() +
			editor.getVerticalScrollMargin();

		if (selectedText) {
			editor.setTextInBufferRange(editor.getSelectedBufferRange(), result);
		} else if (uglifyToFile) {
			const filePath = editor.getPath();
			const filenamePath = filePath.replace('.js', '.min.js');
			fs.writeFile(filenamePath, result, err => {
				if (err) {
					console.error(err.message);
				}
			});
		} else {
			editor.setText(result);
		}

		editor.setCursorBufferPosition(cursorPosition);

		if (editor.getScreenLineCount() > line) {
			editor.scrollToScreenPosition([line, 0]);
		}
	},

	async getSelectedTree() {
		let treeView;
		let treeViewObj;
		treeViewObj = null;
		if (atom.packages.isPackageLoaded('tree-view') === true) {
			treeView = atom.packages.getLoadedPackage('tree-view');
			treeView = require(treeView.mainModulePath).getTreeViewInstance();
			treeViewObj = treeView.serialize();
		}
		if (typeof treeViewObj !== 'undefined' && treeViewObj !== null) {
			if (treeViewObj.selectedPath) {
				const selectedFile = treeViewObj.selectedPath;
				return selectedFile;
			}
		}
	},

	registerOnSaveSub(uglifyEs) {
		this.subscriptions.add(atom.workspace.observeTextEditors(textEditor => {
			this.subscriptions.add(textEditor.onDidSave(() => {
				if (!atom.config.get('atom-uglify-es.onSave')) {
					return;
				}

				const filePath = textEditor.getPath();
				const filenamePath = filePath.replace('.js', '.min.js');

				if (atom.config.get('atom-uglify-es.onSaveIfExists')) {
					fs.access(filenamePath, fs.constants.F_OK, err => {
						if (err) {
							return;
						}
						uglifyEs.uglify(textEditor, true);
					});
				} else {
					uglifyEs.uglify(textEditor, true);
				}
			}));
		}));
	}

};
