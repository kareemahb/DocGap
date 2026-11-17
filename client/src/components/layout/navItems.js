import {
  HomeIcon,
  DocumentIcon,
  TicketIcon,
  TrendIcon,
  ReportIcon,
} from "../icons.jsx";

// Main navigation, shared by the sidebar and the phone-size menu.
// `countKey` names the number shown on the right, filled in by the sidebar.
export const navItems = [
  { to: "/dashboard", label: "Home", icon: HomeIcon },
  {
    to: "/documents",
    label: "Documents",
    icon: DocumentIcon,
    countKey: "documents",
  },
  {
    to: "/issues",
    label: "Ticket issues",
    icon: TicketIcon,
    countKey: "issues",
  },
  { to: "/impact", label: "Impact", icon: TrendIcon },
  { to: "/reports", label: "Reports", icon: ReportIcon },
];
