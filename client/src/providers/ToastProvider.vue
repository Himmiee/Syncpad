<script setup lang="ts">
import { Toast, Toaster, createToaster } from "@ark-ui/vue";
import type { CreateToasterReturn } from "@ark-ui/vue";
import {
  CircleAlertIcon,
  TriangleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  X,
} from "lucide-vue-next";
import { provide } from "vue";

const toaster = createToaster({
  overlap: true,
  placement: "bottom-end",
  gap: 16,
});

const iconMap = {
  success: CircleCheckIcon,
  error: CircleAlertIcon,
  warning: TriangleAlertIcon,
  info: InfoIcon,
};

// Provide toaster with proper typing
provide<CreateToasterReturn>("toaster", toaster);
</script>

<template>
  <div>
    <Toaster :toaster="toaster" v-slot="toast">
      <Toast.Root>
        <div
          style="
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            min-width: 300px;
          "
        >
          <component
            :is="
              toast.type
                ? iconMap[toast.type as keyof typeof iconMap]
                : InfoIcon
            "
            :style="{
              color:
                toast.type === 'success'
                  ? '#10b981'
                  : toast.type === 'error'
                    ? '#ef4444'
                    : toast.type === 'warning'
                      ? '#f59e0b'
                      : '#3b82f6',
              flexShrink: 0,
            }"
          />
          <div style="flex: 1">
            <Toast.Title
              style="font-weight: 600; margin-bottom: 4px; color: #000"
              >{{ toast.title }}</Toast.Title
            >
            <Toast.Description style="font-size: 14px; color: #6b7280">{{
              toast.description
            }}</Toast.Description>
          </div>
          <Toast.CloseTrigger
            style="cursor: pointer; color: #9ca3af; padding: 4px"
          >
            <X :size="16" />
          </Toast.CloseTrigger>
        </div>
      </Toast.Root>
    </Toaster>

    <!-- Slot for child content -->
    <slot />
  </div>
</template>

<style scoped></style>
