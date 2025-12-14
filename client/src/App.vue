<script setup lang="ts">
import { onMounted } from "vue";
import ToastProvider from "./providers/ToastProvider.vue";
import { useAuthStore } from "./stores/auth.store";

const authStore = useAuthStore();

onMounted(() => {
  authStore.fetchCurrentUser();
});
</script>

<template>
  <ToastProvider>
    <RouterView />
  </ToastProvider>
</template>

<style scoped></style>
