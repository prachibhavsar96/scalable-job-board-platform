import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../db/prisma";
import { LoginInput, RegisterInput } from "./auth.validation";

const SALT_ROUNDS = 10;

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

export class EmailAlreadyExistsError extends Error {
  constructor() {
    super("Email already exists");
    this.name = "EmailAlreadyExistsError";
  }
}

function getJwtSecret() {
  return process.env.JWT_SECRET || "development-secret-change-me";
}

function createToken(user: { id: number; email: string; role: string }) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: "8h" }
  );
}

function removePassword<T extends { password: string }>(user: T) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function register(data: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new EmailAlreadyExistsError();
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    },
  });

  return {
    user: removePassword(user),
    token: createToken(user),
  };
}

export async function login(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new InvalidCredentialsError();
  }

  const passwordMatches = await bcrypt.compare(data.password, user.password);

  if (!passwordMatches) {
    throw new InvalidCredentialsError();
  }

  const token = createToken(user);

  return {
    token,
    user: removePassword(user),
  };
}
