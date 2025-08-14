<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <div>
    <nav class="navbar">
      <div>Navigation here</div>
    </nav>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.navbar {
  background-color: #333;
  color: white;
  padding: 1rem;
}
</style>
