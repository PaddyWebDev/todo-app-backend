import { users } from "@prisma/client";
import prisma from "./prisma";

export async function getUserById(userId: string): Promise<users | null> {
  return await prisma.users.findUnique({
    where: {
      id: userId,
    },
  });
}
