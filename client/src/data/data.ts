import {
  FileText,
  CheckSquare,
  Users,
} from "lucide-vue-next";

export const navItems = [
  { to: "/dashboard/notes", icon: FileText, label: "Notes" },
  { to: "/dashboard/tasks", icon: CheckSquare, label: "Tasks" },
  { to: "/dashboard/collaborators", icon: Users, label: "Collaborators" },
];
