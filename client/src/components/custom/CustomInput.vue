<template>
  <div class="mb-4 relative">
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
      <div class="relative">
        <Input
          v-bind="field"
          :type="showPassword && type === 'password' ? 'text' : type"
          :placeholder="placeholder"
          :class="[
            'w-full text-black pr-10',
            meta.touched && errors.length
              ? 'border-red-500 focus:ring-red-400'
              : '',
          ]"
        />

        <!-- Eye / EyeOff Icon for Password -->
        <template v-if="type === 'password'">
          <component
            :is="showPassword ? EyeOff : Eye"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
            @click="showPassword = !showPassword"
          />
        </template>
      </div>
    </Field>

    <!-- Error Message -->
    <ErrorMessage :name="name" class="mt-1 text-sm text-red-500" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Field, ErrorMessage } from "vee-validate";
import Input from "../ui/input/Input.vue";
import { Eye, EyeOff } from "lucide-vue-next";

interface Props {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
}

withDefaults(defineProps<Props>(), {
  type: "text",
});

const showPassword = ref(false);
</script>
