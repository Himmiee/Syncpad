<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import { Plus } from "lucide-vue-next";

const userName = "Haliyah";
</script>

<template>
  <div class="flex flex-col lg:flex-row h-full bg-white text-black overflow-hidden">
    <div class="w-full lg:w-2/3 p-6 lg:p-8 flex flex-col border-gray-200">
      <h1 class="text-2xl sm:text-3xl lg:text-5xl font-semibold mb-6">
        Good afternoon, {{ userName }} <span class="ml-1">👋</span>
      </h1>

      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <Button variant="secondary" size="lg" class="w-full sm:w-auto flex items-center justify-center">
          <Plus class="w-5 h-5 mr-2" /> Add Notes
        </Button>
        <Button variant="secondary" size="lg" class="w-full sm:w-auto flex items-center justify-center">
          <Plus class="w-5 h-5 mr-2" /> Add Task
        </Button>
      </div>

      <div>
        <h2 class="text-lg font-medium mb-3">Recent Notes</h2>
      </div>
    </div>

    <div
      class="w-full lg:w-1/3 mt-6 lg:mt-0 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-200 rounded-xl flex flex-col items-center justify-start"
    >
      <h2 class="text-xl font-semibold mb-4 text-center">Untitled Note</h2>
      <p class="text-gray-500 text-center">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </p>
    </div>
  </div>
</template>
