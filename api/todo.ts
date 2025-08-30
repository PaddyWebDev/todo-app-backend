import express, { Express, Request, Response } from "express";
import prisma from "../prisma/prisma";
import { io } from "../server";
import { getTodoById } from "../utils/todos";
import { encryptSocketData } from "../utils/cryptr";

const app: Express = express();

app.post("/todo/create", async (request: Request, res: Response) => {
  try {
    const { title, description, priority, reminder, userId } = request.body;
    if (!userId) {
      return res.status(400).json({ error: "User Id is required" });
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
    return res.json({ message: "Todo Created" }).status(200);
  } catch (error: any) {
    console.log(error);
    return res
      .json({
        message: "Internal Server Error",
      })
      .status(500);
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
        return response.status(404).json({
          message: "Note not found",
        });
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

      return response
        .json({ message: "Todo updated successfully" })
        .status(200);
    } catch (error: any) {
      console.log(error);
      return response.json({ message: "Internal Server Error" }).status(500);
    }
  }
);

app.patch(
  "/todo/toggle-completion/:todoId",
  async function (request: Request, response: Response) {
    try {
      const todo = await getTodoById(request.params.todoId);

      if (!todo) {
        return response
          .json({
            message: "Todo not found",
          })
          .status(404);
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
      return response
        .json({
          message: "Todo Updated",
        })
        .status(200);
    } catch (error: any) {
      return response
        .json({
          message: "Internal Server Error",
        })
        .status(500);
    }
  }
);

app.delete(
  "/todo/delete/:todoId",
  async function (request: Request, response: Response) {
    try {
      const todo = await getTodoById(request.params.todoId);

      if (!todo) {
        return response.status(404).json({
          message: "Todo not found",
        });
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
    } catch (error: any) {
      return response.json({ message: "Internal Server Error" }).status(500);
    }
  }
);

export default app;
