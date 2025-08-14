<script setup lang="ts">
import { useCounterStore } from "@/stores";
const count = useCounterStore();
</script>
<template>
  <div>
    <div class="text-green-400">{{ count.count }}</div>
    <h1 class="text-black">Home Page</h1>
    <p>Welcome to the home page!</p>
  </div>
</template>
