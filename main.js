const { app, BrowserWindow } = require("electron");
const unhandled = require("electron-unhandled");
const log = require("electron-log");
const path = require("path");

unhandled({ showDialog: true, logger: log.error });
console.log(path.join(__dirname, "../node_modules", ".bin", "electron"));
require("electron-reload")(__dirname, {
	electron: path.join(__dirname, "P2PVoice", "../node_modules", ".bin", "electron"),
	awaitWriteFinish: true,
});

app.whenReady().then(async () => {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
		},
	});

	await mainWindow.loadFile("./public/index.html");
	await mainWindow.webContents.executeJavaScript(errorHandle);
});

app.on("window-all-closed", () => {
	app.quit();
});

process.on("uncaughtException", function (err) {
	console.log(err);
});
process.on("unhandledRejection", function (err) {
	console.log(err);
});

const errorHandle = `
    window.onerror = (err) => {
        console.log(err);
    };
    process.on("uncaughtException", function (err) {
        console.log(err);
    });
    process.on("unhandledRejection", function (err) {
        console.log(err);
    });
    console.log("Injected startup code")
`;
