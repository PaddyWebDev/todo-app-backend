import express, { Express, Request, Response } from "express";
import prisma from "../utils/prisma";
import { io } from "../server";
import { encryptSocketData } from "../utils/cryptr";
import { getTodoById } from "../utils/todos";

const app: Express = express();

app.post("/todo/create", async (request: Request, response: Response) => {
  try {
    const { title, description, priority, reminder, userId } = request.body;
    if (!userId) {
      return response.status(400).send("User Id is required");
    }
    const newPriority = Number(priority);

    const newTodo = await prisma.todo.create({
      data: {
        title,
        description,
        priority: newPriority,
        dueDate: reminder,
        userId,
      },
    });

    io.emit("todo-created", encryptSocketData(JSON.stringify(newTodo)));
    return response.send("Todo Created").status(200);
  } catch (error: any) {
    return response.send("Internal Server Error").status(500);
  }
});

app.put(
  "/todo/update/:todoId",
  async function (request: Request, response: Response) {
    try {
      const { title, description, priority, dueDate, isCompleted } =
        request.body;
      const getTodo = await getTodoById(request.params.todoId);
      if (!getTodo) {
        return response.status(404).send("Note not found");
      }

      const todoPriority = Number(priority);
      const todoDueDate = dueDate ? new Date(dueDate) : null;

      const updatedNote = await prisma.todo.update({
        where: {
          id: getTodo.id,
        },
        data: {
          title,
          description,
          priority: todoPriority,
          dueDate: todoDueDate,
          isCompleted,
        },
      });

      io.emit("todo-updated", encryptSocketData(JSON.stringify(updatedNote)));

      return response.send("Todo updated successfully").status(200);
    } catch (error: any) {
      return response.send("Internal Server Error").status(500);
    }
  }
);

app.patch(
  "/todo/toggle-completion/:todoId",
  async function (request: Request, response: Response) {
    try {
      const todo = await getTodoById(request.params.todoId);

      if (!todo) {
        return response.send("Todo not found").status(404);
      }

      const updatedTodo = await prisma.todo.update({
        where: {
          id: todo.id,
        },
        data: {
          isCompleted: !todo.isCompleted,
        },
      });

      io.emit(
        "todo-completion-status",
        encryptSocketData(
          JSON.stringify({
            completed: updatedTodo.isCompleted,
            todoId: updatedTodo.id,
          })
        )
      );
      return response.send("Todo Updated").status(200);
    } catch (error: any) {
      return response.send("Internal Server Error").status(500);
    }
  }
);

app.delete(
  "/todo/delete/:todoId",
  async function (request: Request, response: Response) {
    try {
      const todo = await getTodoById(request.params.todoId);

      if (!todo) {
        return response.status(404).send("Todo not found");
      }

      const deletedTodo = await prisma.todo.delete({
        where: {
          id: todo.id,
        },
      });

      io.emit(
        "todo-deleted",
        encryptSocketData(
          JSON.stringify({
            todoId: deletedTodo.id,
          })
        )
      );
      return response.send("Todo Deleted Successfully").status(200);
    } catch (error: any) {
      return response.send("Internal Server Error").status(500);
    }
  }
);

app.get("/todo/get/:userId", async (request: Request, response: Response) => {
  try {
    const { userId } = request.params;
    const todos = await prisma.todo.findMany({
      where: {
        userId,
      },
    });

    return response.json(todos).status(200);
  } catch (error) {
    return response.send("Internal Server Error").status(500);
  }
});

export default app;
