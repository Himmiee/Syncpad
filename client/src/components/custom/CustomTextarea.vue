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
    <Field :id="name" :name="name" v-slot="{ field, meta, errors }">
      <Textarea
        v-bind="field"
        :rows="rows"
        :placeholder="placeholder"
        :class="[
          'w-full h-64 text-black',
          meta.touched && errors.length
            ? 'border-red-500 focus:ring-red-400'
            : '',
        ]"
      ></Textarea>
    </Field>

    <!-- Error message -->
    <ErrorMessage :name="name" class="mt-1 text-xs text-red-500" />
  </div>
</template>

<script setup lang="ts">
import { Field, ErrorMessage } from "vee-validate";
import Textarea from "../ui/textarea/Textarea.vue";

interface Props {
  name: string;
  label?: string;
  placeholder?: string;
  rows?: number;
}

withDefaults(defineProps<Props>(), {
  rows: 5,
});
</script>
