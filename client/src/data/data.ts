import {
  FileText,
  CheckSquare,
  Users,
  Settings,
} from "lucide-vue-next";

export const navItems = [
  { to: "/notes", icon: FileText, label: "Notes" },
  { to: "/tasks", icon: CheckSquare, label: "Tasks" },
  { to: "/collaborators", icon: Users, label: "Team" },
  { to: "/settings", icon: Settings, label: "Settings" },
];
