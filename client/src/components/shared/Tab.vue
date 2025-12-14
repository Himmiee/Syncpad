<script setup lang="ts">
import { navItems } from "@/data/data";
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border shadow-2xl z-50 md:hidden"
  >
    <div class="flex items-center justify-around px-2 py-3">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="group flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 active:scale-95 min-w-0 flex-1 relative"
      >
        <div class="relative">
          <component
            :is="item.icon"
            :class="[
              'w-6 h-6 transition-colors duration-300',
              item.to === $route.path ? 'text-primary-purple' : 'text-muted-foreground'
            ]"
          />
        </div>
        <span
          :class="[
            'text-xs transition-colors duration-300 truncate',
            item.to === $route.path ? 'text-primary-purple font-bold' : 'text-muted-foreground font-medium'
          ]"
        >
          {{ item.label }}
        </span>
        <div
          :class="[
            'absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full transition-opacity duration-300',
            item.to === $route.path ? 'opacity-100' : 'opacity-0'
          ]"
        ></div>
      </RouterLink>
    </div>

    <div class="h-safe-area-inset-bottom bg-background/95"></div>
  </nav>
</template>

<style scoped>
.h-safe-area-inset-bottom {
  height: env(safe-area-inset-bottom, 0);
}
</style>
