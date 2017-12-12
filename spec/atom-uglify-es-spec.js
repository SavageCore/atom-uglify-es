'use babel';

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

describe('AtomUglifyEs', () => {
	let workspaceElement;
	let activationPromise;
	let openPromise;
	let editor;

	beforeEach(() => {
		workspaceElement = atom.views.getView(atom.workspace);
		activationPromise = atom.packages.activatePackage('atom-uglify-es');
		openPromise = atom.packages.activatePackage('atom-uglify-es').then(() => {
			atom.workspace.open('sample.js').then(() => {
				editor = atom.workspace.getActiveTextEditor();
				editor.save();
				return editor;
			});
		});
	});

	describe('when the atom-uglify-es:uglify event is triggered', () => {
		it('activates the plugin', () => {
			expect(atom.packages.isPackageActive('atom-uglify-es')).toBe(false);

			atom.commands.dispatch(workspaceElement, 'atom-uglify-es:uglify');

			waitsForPromise(() => {
				return activationPromise;
			});

			runs(() => {
				expect(atom.packages.isPackageActive('atom-uglify-es')).toBe(true);
			});
		});

		it('uglifies code in buffer', () => {
			atom.commands.dispatch(workspaceElement, 'atom-uglify-es:uglify');

			waitsForPromise(() => {
				return openPromise;
			});

			runs(() => {
				editor.setText('async function test() {\n\tconst data = await fetch(\'http://example.com\');\n}');
				editor.onDidChange(() => {
					expect(editor.getText()).toBe('async function test(){await fetch("http://example.com")}');
				});
				atom.commands.dispatch(workspaceElement, 'atom-uglify-es:uglify');
			});
		});

		it('uglifies selected code', () => {
			atom.commands.dispatch(workspaceElement, 'atom-uglify-es:uglify');

			waitsForPromise(() => {
				return openPromise;
			});

			runs(() => {
				editor.setText('<!doctype html>\n<html class="no-js" lang="">\n\t<head>\n\t\t<meta charset="utf-8">\n\t</head>\n\t<body>\n\t\t<script>\n\t\t\tasync function test() {\n\t\t\t\tconst data = await fetch(\'http://example.com\');\n\t\t\t}\n\t\t</script>\n\t</body>\n</html>');
				editor.setSelectedBufferRange([[9, 4], [7, 0]]);
				editor.onDidChange(() => {
					expect(editor.getText()).toBe('<!doctype html>\n<html class="no-js" lang="">\n\t<head>\n\t\t<meta charset="utf-8">\n\t</head>\n\t<body>\n\t\t<script>\nasync function test(){await fetch("http://example.com")}\n\t\t</script>\n\t</body>\n</html>');
				});
				atom.commands.dispatch(workspaceElement, 'atom-uglify-es:uglify');
			});
		});

		it('uglifies code to file', () => {
			atom.config.set('atom-uglify-es.uglifyToFile', true);
			atom.commands.dispatch(workspaceElement, 'atom-uglify-es:uglify');

			waitsForPromise(() => {
				return openPromise;
			});

			runs(() => {
				const minSamplePath = path.dirname(editor.getPath()) + '\\sample.min.js';
				const watcher = chokidar.watch(minSamplePath, {
					persistent: true
				});

				editor.setText('async function test() {\n\tconst data = await fetch(\'http://example.com\');\n}');
				watcher.on('add', () => {
					const data = fs.readFileSync(minSamplePath, {encoding: 'utf-8'});
					expect(data).toBe('async function test(){await fetch("http://example.com")}');
					fs.unlinkSync(minSamplePath);
				});
				atom.commands.dispatch(workspaceElement, 'atom-uglify-es:uglify');
			});
		});
	});
});
