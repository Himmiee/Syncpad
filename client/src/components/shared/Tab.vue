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
        class="group flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 hover:bg-primary/10 active:scale-95 min-w-0 flex-1 relative"
        active-class="bg-primary/10 text-primary"
      >
        <div class="relative">
          <div
            class="p-2 rounded-xl bg-muted group-hover:bg-[#7B63FF]/20  transition-all duration-300"
          >
            <component
              :is="item.icon"
              class="w-5 h-5 text-muted-foreground group-hover:text-black  transition-colors duration-300"
            />
          </div>
          <div
            class="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full opacity-0  transition-opacity duration-300 shadow-lg"
          ></div>
        </div>
        <span
          class="text-xs font-semibold text-muted-foreground group-hover:text-primary  group-hover:text-[#7B63FF] transition-colors duration-300 truncate"
        >
          {{ item.label }}
        </span>
        <div
          class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full opacity-0  transition-opacity duration-300"
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
