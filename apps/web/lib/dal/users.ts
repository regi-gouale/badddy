import prisma from "@/lib/prisma";
import "server-only";

export async function isEmailVerified(email: string) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  });

  return existingUser?.emailVerified ?? false;
}
