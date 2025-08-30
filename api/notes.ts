import express, { Express, Request, Response } from "express";
import prisma from "../prisma/prisma";
import { io } from "../server";
import { getNoteById } from "../utils/notes";
import { decryptSocketData, encryptSocketData } from "../utils/cryptr";

const app: Express = express();

app.post("/notes/create", async (request: Request, res: Response) => {
  const { userId, title, description, content } = request.body;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const newNote = await prisma.note.create({
    data: {
      userId,
      title,
      description,
      content,
    },
  });

  io.emit("note-created", encryptSocketData(JSON.stringify(newNote)));
  return res.json({ message: "Note Created" }).status(200);
});

app.put(
  "/notes/update/:noteId",
  async function (request: Request, response: Response) {
    try {
      const { title, description, content } = request.body;
      const getNote = await getNoteById(request.params.noteId);
      if (!getNote) {
        return response.status(404).json({
          message: "Note not found",
        });
      }

      const updatedNote = await prisma.note.update({
        where: {
          id: getNote.id,
        },
        data: {
          title,
          description,
          content,
        },
      });

      io.emit("note-updated", encryptSocketData(JSON.stringify(updatedNote)));

      return response
        .json({ message: "Note updated successfully" })
        .status(200);
      // check if it note exist
    } catch (error: any) {
      return response.json({ message: "Internal Server Error" }).status(500);
    }
  }
);

app.delete(
  "/notes/delete/:noteId",
  async function (request: Request, response: Response) {
    try {
      const note = await getNoteById(request.params.noteId);
      if (!note) {
        return response.status(404).json({
          message: "Note not found",
        });
      }

      const deletedNote = await prisma.note.delete({
        where: {
          id: note.id,
        },
      });

      io.emit("note-deleted", encryptSocketData(JSON.stringify({ noteId: deletedNote.id })));
    } catch (error: any) {
      return response.json({ message: "Internal Server Error" }).status(500);
    }
  }
);

export default app;
