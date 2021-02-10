import { Message } from "discord.js";
import Logger from "../core/Logger";
import Command from "../core/command";
const axios = require('axios').default;

export default class JoinTeam extends Command {
  constructor(
    name = "join-team",
    description = "Join Any Project With This Command",
    hasArgs = true,
    usage = "/project-name"
  ) {
    super(name, description, hasArgs, usage);
  }
  execute(message: Message, args: String[]) {
    axios.get()
  }
}