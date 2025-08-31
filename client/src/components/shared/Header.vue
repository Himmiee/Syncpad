<script setup lang="ts">
const avatars = [
  "https://i.pravatar.cc/40?img=1",
  "https://i.pravatar.cc/40?img=2",
  "https://i.pravatar.cc/40?img=3"
];
</script>

<template>
  <header class="w-full flex justify-end items-center py-6 px-4 border-b bg-white shadow-sm">
    <div class="flex -space-x-2">
      <img
        v-for="(avatar, i) in avatars"
        :key="i"
        :src="avatar"
        class="w-9 h-9 rounded-full border-2 border-white shadow-sm"
        alt="user avatar"
      />
    </div>
  </header>
</template>
