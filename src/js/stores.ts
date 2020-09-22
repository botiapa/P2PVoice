import { writable } from "svelte/store";
import { Message } from "./ChatManager";
const { ipcRenderer } = require("electron");

let bigStore: { [key: string]: string } = {}; // The store of stores (Used for saving every store's value in one file)

// TODO: Move ipc commands to constants

async function saveToDisk() {
	await ipcRenderer.send("save-stores", JSON.stringify(bigStore));
}

class customWritable<T> {
	store: writable;
	persistent: boolean;
	key: string;
	subscribe: (subscription: (value: any) => void) => () => void;
	set?: (value: any) => void;
	constructor(key: string, defaultValue?: any, persistent = true) {
		this.key = key;
		this.store = writable<T>(defaultValue);
		this.subscribe = this.store.subscribe;
		this.set = (value: any) => {
			this.store.set(value);
			if (this.persistent) this.save(value);
		};
		this.persistent = persistent;
		this.load();
	}

	/**
	 * Save the modified store to disk for persistence
	 */
	save(newValue: any) {
		bigStore[this.key] = newValue;
		saveToDisk();
	}

	/**
	 * Load the saved version of the store (if any)
	 */
	load() {
		if (bigStore[this.key]) this.store.set(bigStore[this.key]);
	}
}
export let messages: customWritable<{ [messageUUID: string]: Message }>;
export let name: customWritable<string>;

export let connections: customWritable<Map<any, any>>;
export let peers: customWritable<string>;
export let metricStats: customWritable<object>;

async function init() {
	let json = ipcRenderer.sendSync("load-stores");
	console.log(json);
	bigStore = JSON.parse(json);
	console.log("Loaded stores.json:");
	console.log(bigStore);
	createStores();
}

function createStores() {
	messages = new customWritable<{ [messageUUID: string]: Message }>("messages", {});
	name = new customWritable<string>("name");

	connections = new customWritable<Map<any, any>>("connections");
	peers = new customWritable("peers", 0, false);
	metricStats = new customWritable("metricStats", {}, false);
}
init();
