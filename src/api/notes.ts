import express, { Express, Request, Response } from "express";
import prisma from "../utils/prisma";
import { io } from "../server";
import { checkNoteExistsById } from "../utils/notes";
import { encryptSocketData } from "../utils/cryptr";

const app: Express = express();

app.post("/notes/create", async (request: Request, res: Response) => {
  const { userId, title, content } = request.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const newNote = await prisma.note.create({
    data: {
      userId,
      title,
      content,
    },
  });

  io.emit("note-created", encryptSocketData(JSON.stringify(newNote)));
  return res.send("Note Created").status(200);
});

app.put(
  "/notes/update/:noteId",
  async function (request: Request, response: Response) {
    try {
      const { title, content } = request.body;
      const noteId = request.params.noteId;
      if (!(await checkNoteExistsById(noteId))) {
        return response.status(404).json({
          message: "Note not found",
        });
      }

      const updatedNote = await prisma.note.update({
        where: {
          id: noteId,
        },
        data: {
          title,
          content,
        },
      });

      io.emit("note-updated", encryptSocketData(JSON.stringify(updatedNote)));

      return response.send("Note updated successfully").status(200);
    } catch (error: any) {
      return response.json({ message: "Internal Server Error" }).status(500);
    }
  }
);

app.delete(
  "/notes/delete/:noteId",
  async function (request: Request, response: Response) {
    try {
      const noteId = request.params.noteId;
      if (!(await checkNoteExistsById(noteId))) {
        return response.status(404).json({
          message: "Note not found",
        });
      }

      await prisma.note.delete({
        where: {
          id: noteId,
        },
      });

      io.emit(
        "note-deleted",
        encryptSocketData(JSON.stringify({ noteId: noteId }))
      );

      return response.send("Note deleted successfully").status(200);
    } catch (error: any) {
      return response.json({ message: "Internal Server Error" }).status(500);
    }
  }
);

app.get("/notes/get/:userId", async (request: Request, response: Response) => {
  try {
    const { userId } = request.params;

    if (!userId) {
      return response.status(400).send("User ID is required");
    }

    const notes = await prisma.note.findMany({
      where: {
        userId,
      },
    });


    return response.json(notes).status(200);
  } catch (error) {
    return response.send("Internal Server Error").status(500);
  }
});

export default app;
