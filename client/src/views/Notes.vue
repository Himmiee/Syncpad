<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import { Plus, FileText, Search, Pin } from "lucide-vue-next";
</script>

<template>
  <div class="flex flex-col lg:flex-row h-full bg-white text-black overflow-hidden">
    <!-- Main Content Area -->
    <div class="w-full lg:w-2/3 p-6 lg:p-8 flex flex-col border-gray-200">
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-2">
          Notes
        </h1>
        <p class="text-gray-500">Create and manage your notes</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 mb-6 ">
        <Button variant="default" size="lg" class="w-full sm:w-auto flex items-center justify-center">
          <Plus class="w-5 h-5 mr-2" /> Add New Note
        </Button>
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div class="flex-1 overflow-auto">
        <h2 class="text-lg font-medium mb-3">Recent Notes</h2>
        
        <!-- Empty State -->
        <div class="flex items-center justify-center h-64">
          <div class="text-center max-w-md">
            <div class="mb-4 flex justify-center">
              <div class="p-4 bg-primary/10 rounded-full">
                <FileText class="w-12 h-12 text-primary" />
              </div>
            </div>
            <h3 class="text-xl font-semibold mb-2">No notes yet</h3>
            <p class="text-gray-500">
              Start creating notes to organize your thoughts and ideas
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Panel -->
    <div
      class="w-full lg:w-1/3 mt-6 lg:mt-0 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-200 rounded-xl flex flex-col items-center justify-start"
    >
      <div class="w-full">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Note Preview</h2>
          <Pin class="w-5 h-5 text-gray-400" />
        </div>
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p class="text-gray-400 text-center text-sm">
            Select a note to view details
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
