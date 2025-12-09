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
      <Button variant="default" class="w-full text-base"
        ><div class="flex gap-2">
          <span>{{ isPending ? "Submitting..." : "Login" }}</span>
          <Loader v-if="isPending" class="animate-spin" /></div
      ></Button>
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
import { useLogin } from "@/api/mutations";
import { Loader } from "lucide-vue-next";
import type { CreateToasterReturn } from "@ark-ui/vue";
import { inject } from "vue";
import { showErrorToaster } from "@/lib/helper";

const { mutate, isPending } = useLogin();
const toaster = inject<CreateToasterReturn>("toaster")!;

const onSubmit = (values: unknown) => {
  const typedValues = values as LoginSchemaType;
  // console.log("Form Submitted:", typedValues);
  mutate(typedValues, {
    onSuccess: (response?) => {
      toaster.success({
        title: "Success!",
        description: response?.message,
      });
    },
    onError: (error: any) => {
      showErrorToaster(error, toaster);
    },
  });
};
</script>
