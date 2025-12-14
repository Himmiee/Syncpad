<script setup lang="ts">
import { User, Bell, Lock, Palette } from "lucide-vue-next";
</script>

<template>
  <div class="flex flex-col h-full bg-white text-black p-6 lg:p-8">
    <div class="mb-8">
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-2">
        Settings
      </h1>
      <p class="text-gray-500">Manage your account and preferences</p>
    </div>

    <div class="grid gap-6 max-w-4xl">
      <!-- Profile Settings -->
      <div class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-primary/10 rounded-lg">
            <User class="w-5 h-5 text-primary" />
          </div>
          <h2 class="text-xl font-semibold">Profile</h2>
        </div>
        <p class="text-gray-500">
          Update your personal information and profile settings
        </p>
      </div>

      <!-- Notifications -->
      <div class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-primary/10 rounded-lg">
            <Bell class="w-5 h-5 text-primary" />
          </div>
          <h2 class="text-xl font-semibold">Notifications</h2>
        </div>
        <p class="text-gray-500">
          Configure how you receive notifications and alerts
        </p>
      </div>

      <!-- Security -->
      <div class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-primary/10 rounded-lg">
            <Lock class="w-5 h-5 text-primary" />
          </div>
          <h2 class="text-xl font-semibold">Security</h2>
        </div>
        <p class="text-gray-500">
          Manage your password and security preferences
        </p>
      </div>

      <!-- Appearance -->
      <div class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-primary/10 rounded-lg">
            <Palette class="w-5 h-5 text-primary" />
          </div>
          <h2 class="text-xl font-semibold">Appearance</h2>
        </div>
        <p class="text-gray-500">
          Customize the look and feel of your workspace
        </p>
      </div>
    </div>
  </div>
</template>
