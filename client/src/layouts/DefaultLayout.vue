<script setup lang="ts">
import { RouterView } from "vue-router";
import Header from "@/components/shared/Header.vue";
import Sidebar from "@/components/shared/Sidebar.vue";
import Tab from "@/components/shared/Tab.vue";
</script>

<template>
  <div class="flex h-screen bg-background">
    <div class="hidden md:block">
      <Sidebar />
    </div>

    <div class="flex flex-1 flex-col">
      <Header />

      <main class="flex-1 bg-muted  overflow-y-auto ">
        <RouterView />
      </main>
    </div>

    <Tab />
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  main {
    padding-bottom: calc(5rem + env(safe-area-inset-bottom, 0));
  }
}
</style>
