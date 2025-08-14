<template>
  <div class="mb-4">
    <!-- Label -->
    <label
      v-if="label"
      :for="name"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      {{ label }}
    </label>

    <!-- Field -->
    <Field
      :id="name"
      :name="name"
      :type="type"
      v-slot="{ field, meta, errors }"
    >
      <Input
        v-bind="field"
        :type="type"
        :placeholder="placeholder"
        :class="[
          'w-full text-black',
          meta.touched && errors.length
            ? 'border-red-500 focus:ring-red-400'
            : '',
        ]"
      />
    </Field>

    <!-- Error Message -->
    <ErrorMessage :name="name" class="mt-1 text-sm text-red-500" />
  </div>
</template>

<script setup lang="ts">
import { Field, ErrorMessage } from "vee-validate";
import Input from "../ui/input/Input.vue";

interface Props {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
}

withDefaults(defineProps<Props>(), {
  type: "text",
});
</script>
