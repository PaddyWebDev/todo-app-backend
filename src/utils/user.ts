import { User } from "@prisma/client";
import prisma from "./prisma";

export async function getUserById(userId: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
}
