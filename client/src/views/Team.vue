<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import { UserPlus, Users } from "lucide-vue-next";
</script>

<template>
  <div class="flex flex-col h-full bg-white text-black p-6 lg:p-8">
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-2">
        Team
      </h1>
      <p class="text-gray-500">Collaborate with your team members</p>
    </div>

    <div class="mb-6">
      <Button variant="default" size="lg" class="flex items-center">
        <UserPlus class="w-5 h-5 mr-2" /> Invite Team Member
      </Button>
    </div>

    <div class="flex-1 flex items-center justify-center">
      <div class="text-center max-w-md">
        <div class="mb-4 flex justify-center">
          <div class="p-4 bg-primary/10 rounded-full">
            <Users class="w-12 h-12 text-primary" />
          </div>
        </div>
        <h2 class="text-xl font-semibold mb-2">No team members yet</h2>
        <p class="text-gray-500 mb-4">
          Invite collaborators to work together on notes and tasks
        </p>
      </div>
    </div>
  </div>
</template>
