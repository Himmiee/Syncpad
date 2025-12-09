<template>
  <section class="md:px-5 py-24 md:py-0">
    <div class="text-center text-black/60 text-lg space-y-2 mb-8">
      <p class="text-foreground text-4xl font-bold">Get started for free</p>
      <div>
        <p>Start Collaborating in seconds</p>
        <p>In few steps.</p>
      </div>
    </div>
    <Form
      :validation-schema="registerSchema"
      @submit="onSubmit"
      class="max-w-3xl mx-auto space-y-6"
    >
      <CustomInput name="username" label="" placeholder="Username" />
      <CustomInput name="email" label="" placeholder="Email" />
      <CustomInput name="password" label="" placeholder=" Password" />
      <Button variant="default" class="w-full text-base">
        <div class="flex gap-2">
          <span>{{ isPending ? "Submitting..." : "Sign Up" }}</span>
          <Loader v-if="isPending" class="animate-spin" />
        </div>
      </Button>
    </Form>
    <p class="text-black text-sm text-center pt-4">
      Already have an account?
      <RouterLink to="/auth/login" class="text-primary hover:underline">
        Login
      </RouterLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import { Form } from "vee-validate";
import { registerSchema, type RegisterSchemaType } from "@/validation/schema";
import CustomInput from "@/components/custom/CustomInput.vue";
import Button from "@/components/ui/button/Button.vue";
import { useRegister } from "@/api/mutations";
import type { CreateToasterReturn } from "@ark-ui/vue";
import { inject } from "vue";
import { useRouter } from "vue-router";
import { showErrorToaster } from "@/lib/helper";

const { mutate, isPending } = useRegister();
const toaster = inject<CreateToasterReturn>("toaster")!;
const router = useRouter();

const onSubmit = (values: unknown) => {
  const typedValues = values as RegisterSchemaType;
  // console.log("Form Submitted:", typedValues);
  mutate(typedValues, {
    onSuccess: (response?) => {
      (toaster.success({
        title: "Success!",
        description: response?.message,
      }),
        router.push("/auth/login"));
    },
    onError: (error: any) => {
      showErrorToaster(error, toaster);
    },
  });
};
</script>
