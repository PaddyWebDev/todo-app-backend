import { Note } from "@prisma/client";
import prisma from "./prisma";

export async function getNoteById(noteId: string): Promise<Note | null> {
  return (
    (await prisma.note.findUnique({
      where: {
        id: noteId,
      },
    })) || null
  );
}

export async function checkNoteExistsById(id: string) {
  return await prisma.note.findUnique({
    where: {
      id
    },select: {
      title: true,
    }
  })
}
