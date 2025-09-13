import prisma from "../config/db";

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(data: {
  email: string;
  name?: string;
  preferredLanguage?: string;
}) {
  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      preferred_language: data.preferredLanguage ?? null,
    },
  });
}

export async function updateUser(
  id: string,
  data: { name?: string; preferredLanguage?: string }
) {
  return prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      preferred_language: data.preferredLanguage,
      // modifiedAt: new Date(),
    },
  });
}

export async function listUsers(limit = 50) {
  return prisma.user.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}
