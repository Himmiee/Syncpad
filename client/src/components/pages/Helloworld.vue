<template>
  <div class="bg-background text-foreground min-h-screen p-6">
    <Button variant="default" size="default">
      {{ message }}
    </Button>

    <div
      class="bg-card text-card-foreground p-4 rounded-radius border border-border mt-4 shadow-sm"
    >
      <p class="text-muted-foreground">This is muted text</p>
      <Button variant="ghost" size="sm" class="mt-2"> Accent Button </Button>
    </div>

    <!-- testing out buttons -->
    <div class="mt-6 space-y-2">
      <Button variant="destructive">Delete Item</Button>
      <Button variant="outline">Outline Button</Button>
      <Button variant="secondary" size="lg">Large Secondary</Button>
      <Button variant="link">Link Button</Button>
    </div>

    <div>
      <Input type="text" />
      <Select>
        <SelectTrigger class="w-48">
          <SelectValue placeholder="Choose an option" />
        </SelectTrigger>

        <SelectContent class="w-48">
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div>
      Textarea
      <Textarea class="h-48"></Textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "../ui/button";
import Input from "../ui/input/Input.vue";
import Select from "../ui/select/Select.vue";
import SelectContent from "../ui/select/SelectContent.vue";
import SelectItem from "../ui/select/SelectItem.vue";
import SelectTrigger from "../ui/select/SelectTrigger.vue";
import SelectValue from "../ui/select/SelectValue.vue";
import Textarea from "../ui/textarea/Textarea.vue";

const props = defineProps<{ msg?: string }>();
const message = props.msg ?? "Hi lol";
</script>
