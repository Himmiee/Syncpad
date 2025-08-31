<script setup lang="ts">
import { RouterView } from "vue-router";
import logo from "../assets/logo/syncpad-logo.svg";
</script>

<template>
  <div
    class="bg-white md:bg-gray-50 min-h-screen flex items-start md:items-center md:justify-center"
  >
    <div
      class="bg-white md:shadow-sm md:border border-gray-100 rounded-2xl p-6 md:px-8 min-h-[300px] flex flex-col w-full max-w-lg"
    >
      <div class="flex items-center gap-2 mb-6">
        <img :src="logo" alt="Syncpad Logo" class="w-9 h-auto" />
        <p class="text-black text-xl font-bold">
          Sync<span class="text-[#7B63FF]">Pad</span>
        </p>
      </div>

      <main class="w-full flex-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped></style>
