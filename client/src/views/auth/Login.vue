<template>
  <section class="md:px-5 py-24 md:py-0">
    <div class="text-center text-black/60 text-lg space-y-2 mb-8">
      <p class="text-foreground text-4xl font-bold">Welcome Back</p>
      <div>
        <p>Login to continue</p>
        <!-- <p>Collaborate with your team instantly.</p> -->
      </div>
    </div>

    <Form
      :validation-schema="loginSchema"
      @submit="onSubmit"
      class="max-w-3xl mx-auto space-y-6"
    >
      <CustomInput name="email" label="" placeholder="Email" />
      <CustomInput
        name="password"
        label=""
        placeholder="Password"
        type="password"
      />
      <Button variant="default" class="w-full text-base">Login</Button>
    </Form>

    <p class="text-black text-sm text-center pt-4">
      Don’t have an account?
      <RouterLink to="/auth/register" class="text-primary hover:underline">
        Sign Up
      </RouterLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import { Form } from "vee-validate";
import { loginSchema, type LoginSchemaType } from "@/validation/schema";
import CustomInput from "@/components/custom/CustomInput.vue";
import Button from "@/components/ui/button/Button.vue";

const onSubmit = (values: unknown) => {
  const typedValues = values as LoginSchemaType;
  console.log("Form Submitted:", typedValues);
};
</script>
