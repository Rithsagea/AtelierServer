import Elysia, { t } from "elysia";
import type { ElysiaWS } from "elysia/ws";

const WebsocketMessageSchema = t.Object({
  command: t.String(),
  data: t.Any(),
});

interface LoginMessage {
  command: "login";
  data: string;
}

interface ChatMessage {
  command: "chat";
  data: string;
}

type WebsocketMessage = LoginMessage | ChatMessage;

interface Connection {
  ws: ElysiaWS<any, any>;
  username: string;
}

const connections: Record<string, Connection> = {};

export const WebsocketEndpoint = new Elysia({ prefix: "/ws" }).ws("/", {
  body: WebsocketMessageSchema,
  open: (ws) => {
    console.log(`Websocket Opened: ${ws.id}`);
  },
  message: (ws: ElysiaWS<any, any>, message) => {
    const { command, data } = message as WebsocketMessage;
    switch (command) {
      case "login":
        console.log(`${data} Logging in!`);
        connections[ws.id] = { ws, username: data };
        break;
      case "chat":
        console.log(`Received Chat Message: ${data}`);
        for (const conn of Object.values(connections)) {
          conn.ws.send({
            command: "chat",
            data: { sender: connections[ws.id].username, message: data },
          });
        }
    }
  },
});
