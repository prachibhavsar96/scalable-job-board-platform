import bcrypt from "bcrypt";
import prisma from "../../db/prisma";
import { CreateUserInput } from "./user.validation";

function selectSafeUser() {
  return {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  };
}

export async function createUser(data: CreateUserInput) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
    select: selectSafeUser(),
  });
}

export function getUsers() {
  return prisma.user.findMany({
    select: selectSafeUser(),
    orderBy: { createdAt: "desc" },
  });
}
