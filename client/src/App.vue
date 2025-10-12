<script setup lang="ts">
import ToastProvider from "./providers/ToastProvider.vue";
</script>

<template>
  <ToastProvider>
    <RouterView />
  </ToastProvider>
</template>

<style scoped></style>
