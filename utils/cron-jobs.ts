import { CronJob } from "cron";
import prisma from "../prisma/prisma";
import { Todo } from "@prisma/client";
import { getUserById } from "./user";

// Placeholder for fetching todos. Replace with actual logic to fetch todos from your database.
//  const todos = [
//   { id: 1, email: "user1@example.com", timer: Date.now() + 60 * 1000 }, // 1 minute from now
//   { id: 2, email: "user2@example.com", timer: Date.now() + 90 * 1000 }, // 1.5 minutes from now
// ];

async function fetchTodos() {
  return await prisma.todo.findMany({
    where: {
      dueDate: {
        not: null,
      },
    },
  });
}
const oneMinute = 60000;
const cronJob = new CronJob("*/1 * * * *", async () => {
  try {
    const todos: Todo[] = await fetchTodos();
    console.log("Running a task every minute");

    todos.forEach(async (todo: Todo) => {
      if (
        new Date(Date.now()).getTime() >=
        todo.dueDate!.getTime() - oneMinute
      ) {
        console.log(
          `Reminder: Todo "${todo.title}" is due in less than 1 minute.`
        );
      }
    });
  } catch (error) {}
});

cronJob.start();

export default cronJob;
