<script setup lang="ts">
import { ref } from "vue";
import logo from "../../assets/logo/syncpad-logo.svg";
import { ChevronLeft, ChevronRight, LogOut, Loader } from "lucide-vue-next";
import { navItems } from "@/data/data";
import { useLogout } from "@/composables/useAuth";

const isCollapsed = ref(false);
const currentYear = new Date().getFullYear();
const isLoggingOut = ref(false);

const { mutate: logout } = useLogout();

const handleLogout = async () => {
  isLoggingOut.value = true;
  
  // Simulated delay for better UX
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  logout();
};
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
        class="group flex items-center gap-4 py-3 px-3 rounded-xl transition-all duration-300 hover:bg-primary-10 hover:shadow-sm active:scale-[0.98] text-muted-foreground hover:text-primary-purple font-medium relative"
        active-class="bg-primary-10 text-primary-purple shadow-sm"
      >
        <div class="relative">
          <div
            :class="[
              'p-2 rounded-xl transition-all duration-300',
              'bg-muted group-hover:bg-primary',
              item.to === $route.path ? 'bg-primary shadow-primary-glow' : ''
            ]"
          >
            <component
              :is="item.icon"
              :class="[
                'w-5 h-5 transition-colors duration-300',
                'text-muted-foreground group-hover:text-white',
                item.to === $route.path ? 'text-white' : ''
              ]"
            />
          </div>
          <div
            :class="[
              'absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full transition-opacity duration-300 shadow-lg',
              item.to === $route.path ? 'opacity-100' : 'opacity-0'
            ]"
          ></div>
        </div>
        <span v-if="!isCollapsed" :class="['font-medium', item.to === $route.path ? 'font-bold' : '']">{{ item.label }}</span>
        <div
          :class="[
            'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full transition-opacity duration-300',
            item.to === $route.path ? 'opacity-100' : 'opacity-0'
          ]"
        ></div>
      </RouterLink>
    </nav>

    <!-- Logout Button -->
    <div class="p-2">
      <button
        @click="handleLogout"
        :disabled="isLoggingOut"
        class="group w-full flex items-center gap-4 py-3 px-3 rounded-xl transition-all duration-300 hover:bg-red-50 active:scale-[0.98] text-muted-foreground hover:text-red-600 font-medium"
      >
        <div class="p-2 rounded-xl transition-all duration-300 bg-muted group-hover:bg-red-500">
          <LogOut class="w-5 h-5 transition-colors duration-300 text-muted-foreground group-hover:text-white" />
        </div>
        <span v-if="!isCollapsed" class="font-medium">Logout</span>
      </button>
    </div>

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

  <!-- Logging Out Modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isLoggingOut"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
          <div class="flex justify-center mb-4">
            <div class="p-4 bg-primary/10 rounded-full">
              <Loader class="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            Logging out...
          </h3>
          <p class="text-gray-500 text-sm">
            Please wait while we securely log you out
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
