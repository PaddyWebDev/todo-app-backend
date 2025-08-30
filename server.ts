import express, { Request, Express, Response } from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import notesRoute from "./api/notes";
import todoRoute from "./api/todo";
import cronJob from "./utils/cron-jobs";

const port = 9000;
dotenv.config();

const app: Express = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONT_END_URL,
  },
});

const whiteList: string[] = [process.env.FRONT_END_URL!];

const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (whiteList.indexOf(origin!) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
});
io.on("disconnect", (socket) => {
  console.log("user disconnected", socket.id);
});

app.use(express.json());
app.use(cors(corsOptions));

// Start cron job
// if (!cronJob.running) {
//   cronJob.start();
// }

app.get("/", async (req: Request, res: Response) => {
  res.json({
    message: "Backend for todo list application",
  });
});

app.use("/", notesRoute);
app.use("/", todoRoute);

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
export { app, io, server };
