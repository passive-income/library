"use client";

import React from "react";
import { signUpSchema } from "@/lib/validations";
import AuthForm from "@/components/AuthForm";
import { signUp } from "@/lib/actions/auth";

const Page = () => (
  <AuthForm
    type="SIGN_UP"
    schema={signUpSchema}
    defaultValues={{
      email: "",
      password: "",
      fullName: "",
      userId: 0,
      userCard: "",
    }}
    onSubmit={signUp}
  />
);
export default Page;
