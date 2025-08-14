<template>
  <Form
    :validation-schema="schema"
    @submit="onSubmit"
    class="max-w-3xl mx-auto py-24 space-y-6"
  >
    <CustomInput name="email" label="Email" placeholder="Enter your email" />

    <CustomTextarea name="message" label="Message" placeholder="Your message" />

    <Button variant="default" class="w-full"> Submit </Button>
  </Form>
</template>

<script setup lang="ts">
import { Form } from "vee-validate";
import * as yup from "yup";
import { ref } from "vue";

import CustomInput from "@/components/custom/CustomInput.vue";
import CustomTextarea from "@/components/custom/CustomTextarea.vue";
import Button from "@/components/ui/button/Button.vue";

const avatar = ref<File | null>(null);

const schema = yup.object({
  email: yup.string().required("Email is required").email("Invalid email"),
  message: yup
    .string()
    .required("Message is required")
    .min(10, "Message must be at least 10 characters"),
});

const onSubmit = (values: Record<string, any>) => {
  console.log("Form Submitted:", values);

  const formData = new FormData();
  formData.append("email", values.email);
  formData.append("message", values.message);
};
</script>
