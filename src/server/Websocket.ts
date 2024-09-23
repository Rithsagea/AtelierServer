import Elysia, { t } from "elysia";
import type { ElysiaWS } from "elysia/ws";
import type { Ability, Skill } from "../dnd/Stats";

const WebsocketMessageSchema = t.Object({
  command: t.String(),
  data: t.Any(),
});

type Connection = {
  ws: ElysiaWS<any, any>;
  username: string;
};
const connections: Record<string, Connection> = {};

type MessageHandler<T> = (ws: ElysiaWS<any, any>, data: T) => void;
const handlers: Record<string, MessageHandler<any>> = {};

handlers["login"] = (ws, data: string) => {
  console.log(`${data} Logging in!`);
  connections[ws.id] = { ws, username: data };
};

handlers["chat"] = (ws, data: string) => {
  console.log(`Received Chat Message: ${data}`);
  for (const conn of Object.values(connections)) {
    conn.ws.send({
      command: "chat",
      data: { sender: connections[ws.id].username, message: data },
    });
  }
};

type RollType<T extends string, V> = { type: T; value: V };
type RollData =
  | RollType<"ability", Ability>
  | RollType<"saving", Ability>
  | RollType<"skill", Skill>;
handlers["roll"] = (ws, data: RollData) => {
  console.log(`${ws.id} performed ${data.type} roll for ${data.value}`);
};

export const WebsocketEndpoint = new Elysia({ prefix: "/ws" }).ws("/", {
  body: WebsocketMessageSchema,
  open: (ws) => {
    console.log(`Websocket Opened: ${ws.id}`);
  },
  message: (ws: ElysiaWS<any, any>, message) => {
    const { command, data } = message;
    handlers[command]?.(ws, data);
  },
});
