<script setup lang="ts">
import { ref } from "vue";
import logo from "../../assets/logo/syncpad-logo.svg";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { navItems } from "@/data/data";

const isCollapsed = ref(false);
const currentYear = new Date().getFullYear();
</script>

<template>
  <aside
    :class="[
      'h-screen bg-background shadow-xl flex flex-col transition-all duration-300 border-r border-border',
      isCollapsed ? 'w-20' : 'w-64',
    ]"
  >
    <div class="flex items-center justify-between py-6 px-4">
      <div v-if="!isCollapsed" class="flex items-center gap-2">
        <img :src="logo" alt="Syncpad Logo" class="w-8 h-auto" />
        <p class="text-foreground text-lg font-bold">
          Sync<span class="text-primary">Pad</span>
        </p>
      </div>
      <button
        @click="isCollapsed = !isCollapsed"
        class="p-2 rounded-lg hover:bg-muted transition-colors duration-200 cursor-pointer bg-slate-50"
      >
        <ChevronLeft v-if="!isCollapsed" class="w-5 h-5 text-foreground" />
        <ChevronRight v-else class="w-5 h-5 text-foreground" />
      </button>
    </div>

    <nav class="flex-1 p-2 space-y-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="group flex items-center gap-4 py-3 px-3 rounded-xl transition-all duration-300 hover:bg-primary/10 hover:shadow-sm active:scale-[0.98] text-muted-foreground hover:text-primary font-medium relative"
        active-class="bg-primary/10 text-primary shadow-sm"
      >
        <div class="relative">
          <div
            class="p-2 rounded-xl bg-muted group-hover:bg-primary group-[.router-link-active]:bg-primary transition-all duration-300"
          >
            <component
              :is="item.icon"
              class="w-5 h-5 text-muted-foreground group-hover:text-white group-[.router-link-active]:text-white transition-colors duration-300"
            />
          </div>
          <div
            class="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full opacity-0 group-[.router-link-active]:opacity-100 transition-opacity duration-300 shadow-lg"
          ></div>
        </div>
        <span v-if="!isCollapsed" class="font-medium">{{ item.label }}</span>
        <div
          class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full opacity-0 group-[.router-link-active]:opacity-100 transition-opacity duration-300"
        ></div>
      </RouterLink>
    </nav>

    <div class="p-4 border-t border-border">
      <div class="text-center">
        <p
          v-if="!isCollapsed"
          class="text-xs text-muted-foreground font-medium"
        >
          © {{ currentYear }} SyncPad
        </p>
        <p v-if="!isCollapsed" class="text-xs text-muted-foreground mt-1">
          v1.0.0
        </p>
      </div>
    </div>
  </aside>
</template>
