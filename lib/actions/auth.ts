"use server";

import { usersTable } from "@/database/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { db } from "@/database/drizzle";
import { signIn } from "@/auth";
import { error } from "next/dist/build/output/log";
import { headers } from "next/headers";
import ratelimit from "@/lib/ratelimit";
import { redirect } from "next/navigation";

export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">,
) => {
  const { email, password } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return redirect("/too-fast");
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      console.log(result.error, "Signin error");
      return {
        success: false,
        error: "Signin error",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.log(error, "Signin error");
    return {
      success: false,
      error: "Signin error",
    };
  }
};

export const signUp = async (params: AuthCredentials) => {
  const { fullName, email, password, userId, userCard } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return redirect("/too-fast");
  }

  const existingUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      success: false,
      error: "User with this email already exists",
    };
  }

  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(usersTable).values({
      fullName,
      email,
      password: hashedPassword,
      userId,
      userCard,
    });

    await signInWithCredentials({ email, password });

    return {
      success: true,
    };
  } catch (error) {
    console.log(error, "Signup error");
    return {
      success: false,
      error: "Signup error",
    };
  }
};
