import { writable } from "svelte/store";
import { Message } from "./ChatManager";

export const messages = writable<{ [messageUUID: string]: Message }>({});
