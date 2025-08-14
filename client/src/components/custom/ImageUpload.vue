<template>
  <div class="mb-6 flex justify-center">
    <div
      class="relative w-24 h-24 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-teal-400 transition"
      @click="triggerFileInput"
    >
      <img
        v-if="imageUrl"
        :src="imageUrl"
        alt="Avatar"
        class="w-full h-full object-cover"
      />
    </div>

    <Input
      type="file"
      ref="fileInput"
      class="hidden"
      @change="handleFileChange"
      accept="image/*"
    />
  </div>

  <p v-if="error" class="text-center text-sm text-red-500">{{ error }}</p>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Input from "../ui/input/Input.vue";

interface Props {
  modelValue?: File | null;
  error?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);

const fileInput = ref<HTMLInputElement | null>(null);
const imageUrl = ref<string | null>(null);
const error = ref<string | null>(props.error || null);

const triggerFileInput = () => fileInput.value?.click();

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target.files || !target.files[0]) return;

  const file = target.files[0];

  if (!file.type.startsWith("image/")) {
    error.value = "Please select a valid image file.";
    return;
  }

  error.value = null;
  emit("update:modelValue", file);

  const reader = new FileReader();
  reader.onload = (event) => {
    imageUrl.value = event.target?.result as string;
  };
  reader.readAsDataURL(file);
};

// Watch for external modelValue changes
watch(
  () => props.modelValue,
  (newFile) => {
    if (!newFile) imageUrl.value = null;
    else {
      const reader = new FileReader();
      reader.onload = (event) => {
        imageUrl.value = event.target?.result as string;
      };
      reader.readAsDataURL(newFile);
    }
  }
);
</script>
