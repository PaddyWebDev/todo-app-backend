import { CronJob } from "cron";
import prisma from "./prisma";
import { Todo } from "@prisma/client";
import { getUserById } from "./user";


async function fetchTodos() {
  return await prisma.todo.findMany({
    where: {
      dueDate: {
        not: null,
      },
      isCompleted: false,
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
