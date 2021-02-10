require("dotenv").config();
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { discordToken, prefix } from "./config";
import { Client, Collection } from "discord.js";
import Logger from "./core/Logger";
import { Bot } from "./types/types";
import commands from "./commands";
import { populateRole } from './database/index';
import { KEYSTORE_COLLECTION_NAME } from "./database/model/KeyStore";
import { MEETING_COLELCTION_NAME } from "./database/model/Meeting";
import { PROJECT_COLLECTION_NAME } from "./database/model/Project";
import { ROLES_COLLECTION_NAME } from "./database/model/Role";
import { USER_COLLECTION_NAME } from "./database/model/User";

//Firestore dec start
try {
  admin.initializeApp(functions.config().firebase);
} catch (e) {
  functions.logger.info("Error in initilizing firestore");
}
export const firestoreInstance = admin.firestore();
export const firestoreAltInstance = admin.firestore;
export type FirestoreDocRef = FirebaseFirestore.DocumentReference<
  FirebaseFirestore.DocumentData
>;
export type FirestoreDoc = FirebaseFirestore.DocumentData;
export const usersRef = firestoreInstance.collection(USER_COLLECTION_NAME);
export const projectsRef = firestoreInstance.collection(
  PROJECT_COLLECTION_NAME
);
export const meetingsRef = firestoreInstance.collection(
  MEETING_COLELCTION_NAME
);
export const keystoreRef = firestoreInstance.collection(KEYSTORE_COLLECTION_NAME);
export const rolesRef = firestoreInstance.collection(ROLES_COLLECTION_NAME);
export const PROJECT_FCM_TOPIC = "projects";
(async () => {
  await populateRole();
})()
//Firestore dec end

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

export const bot: Bot = new Client();
bot.commands = new Collection();

bot.on("ready", () => {
  Logger.info(` ${bot.user.tag} reporting for duty !`);
});

try {
  for (const command of commands)
    bot.commands.set(command.name, command.convertToObject());
} catch (err) {
  Logger.info(err);
}

bot.on("message", (message: any) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    bot.commands.get(commandName) ||
    bot.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  if (!!command.hasArgs && args.length == 0) {
    let reply = `You didn't provide any arguments, ${message.author}!`;
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("there was an error trying to execute that command!");
  }
});

bot.login(discordToken).catch((err) => Logger.error(err));
