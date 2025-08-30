import { Note } from "@prisma/client";
import prisma from "../prisma/prisma";

export async function getNoteById(noteId: string): Promise<Note | null> {
  return (
    (await prisma.note.findUnique({
      where: {
        id: noteId,
      },
    })) || null
  );
}
