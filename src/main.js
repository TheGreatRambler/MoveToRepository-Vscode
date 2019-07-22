const vscode = require("vscode");
const path = require("path");

const isWindows = (process.platform === "win32");

function getCDCommand(folder) {
	var command;
	// Quotes are used for safty
	if (isWindows) {
		// /d is required to change drives automatically
		command = 'cd /d "' + folder + '"';
	} else {
		command = 'cd "' + folder + '"';
	}
	return command;
}

function start() {
	var currentConfig = vscode.workspace.getConfiguration();
	var changeOnFile = currentConfig.get("changeTerminalOnWorkspace.changeOnFile");
	var terminalToUse = currentConfig.get("changeTerminalOnWorkspace.terminalToUse");
	var changeTerminalOnMove = currentConfig.get("changeTerminalOnWorkspace.changeTerminalOnMove");

	var currentFolder;

	vscode.window.onDidChangeActiveTerminal(function(openedTerminal) {
		if (changeTerminalOnMove && currentFolder) {
			// Change automatically because these is no framework to see if the command has
			// already been sent yet
			openedTerminal.sendText(getCDCommand(currentFolder));
		}
	});

	vscode.workspace.onDidOpenTextDocument(function(openedDocument) {
		var uriOfFile = openedDocument.uri;

		if (uriOfFile) {
			// Hopefully works
			var workspaceFolderOfFile = vscode.workspace.getWorkspaceFolder(uriOfFile).uri.fsPath;
			var folderOfFile = path.dirname(uriOfFile.fsPath);

			var needToCD = false;
			if (changeOnFile) {
				// Change on every folder, not just workspace
				if (currentFolder !== folderOfFile) {
					// The folder needs to change
					needToCD = true;
					currentFolder = folderOfFile;
				}
			} else {
				// Only change on workspace
				if (currentFolder !== workspaceFolderOfFile) {
					// The folder needs to change
					needToCD = true;
					currentFolder = workspaceFolderOfFile;
				}
			}

			if (needToCD) {
				var command = getCDCommand(currentFolder);
				if (terminalToUse == "Active") {
					// Use active
					vscode.window.activeTerminal.sendText(command);
				} else {
					// Use first
					vscode.window.terminals[0].sendText(command);
				}
			}
		}
	});
}

function end() {
	// Nothing yet
}

// Exports to Vscode
module.exports = {
	activate: start,
	deactivate: end
};