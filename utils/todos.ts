import { Todo } from "@prisma/client";
import prisma from "../prisma/prisma";

export async function getTodoById(todoId: string): Promise<Todo | null> {
  return (
    (await prisma.todo.findUnique({
      where: {
        id: todoId,
      },
    })) || null
  );
}
