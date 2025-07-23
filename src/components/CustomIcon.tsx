import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Plus,
  Star,
  Calendar,
  Download,
  FileText,
  Hash,
  Trash2,
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileVideo,
  Image,
  FileSpreadsheet,
  Presentation,
  Cloud,
  Home,
  LogOut,
  Settings,
  Users,
  Moon,
  Sun,
  Monitor,
  X,
  Check,
  Circle,
  MoreVertical,
  Upload,
  Pencil,
  Grid,
  List,
  Brain,
  Loader,
} from "lucide-react";

const iconMap = {
  Plus,
  Star,
  Folder,
  ChevronRight,
  ChevronDown,
  Calendar,
  Download,
  FileText,
  Hash,
  Trash2,
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileVideo,
  Image,
  FileSpreadsheet,
  Presentation,
  Cloud,
  Home,
  LogOut,
  Settings,
  Users,
  Moon,
  Sun,
  Monitor,
  X,
  Check,
  Circle,
  MoreVertical,
  Upload,
  Pencil,
  Grid,
  List,
  Brain,
  Loader,
};

export const iconSizeClass = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
  "2xl": "h-10 w-10",
  "3xl": "h-16 w-16",
  "4xl": "h-24 w-24",
};

export const CustomIcon = (p: {
  iconName: keyof typeof iconMap;
  size: keyof typeof iconSizeClass;
  className?: string;
}) => {
  const Icon = iconMap[p.iconName];
  const sizeClass = iconSizeClass[p.size];

  return <Icon className={cn(sizeClass, p.className)} />;
};
