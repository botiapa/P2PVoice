const { app, BrowserWindow, ipcMain } = require("electron");
const unhandled = require("electron-unhandled");
const log = require("electron-log");
const path = require("path");
const fs = require("fs").promises;

unhandled({ showDialog: true, logger: log.error });
require("electron-reload")(__dirname, {
	electron: path.join(__dirname, "P2PVoice", "../node_modules", ".bin", "electron"),
	awaitWriteFinish: true,
});

let STORES_PATH = path.join(app.getPath("userData"), "stores");

app.setName("P2PVoice");
app.whenReady().then(async () => {
	try {
		await fs.writeFile(STORES_PATH, "{}", { flag: "wx" }); // Create storefile if it doesn't exist
	} catch (_) {}
	ipcMain.on("save-stores", async (event, bigStore) => {
		await fs.writeFile(STORES_PATH, bigStore);
	});
	ipcMain.on("load-stores", async (event, arg) => {
		let bigStore = await fs.readFile(STORES_PATH, { encoding: "utf8" });
		event.returnValue = bigStore;
	});
	const mainWindow = new BrowserWindow({
		width: 900,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
		},
	});
	await mainWindow.loadFile("./public/index.html");
	await mainWindow.webContents.executeJavaScript(inject);
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

const inject = `
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
