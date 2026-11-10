const DAY_MS = 24 * 60 * 60 * 1000;

// Small seeded random generator: same "random" values on every run
const createRandom = (seed) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const buildDemoData = (now = new Date()) => {
  const random = createRandom(2026);
  const daysAgo = (days) => new Date(now.getTime() - days * DAY_MS);
  const between = (min, max) => min + random() * (max - min);
  const pick = (list) => list[Math.floor(random() * list.length)];

  // `count` dates spread evenly between two points in the past
  const spread = (count, fromDaysAgo, toDaysAgo) =>
    Array.from({ length: count }, (_, i) =>
      daysAgo(fromDaysAgo - ((fromDaysAgo - toDaysAgo) * (i + 0.5)) / count),
    );

  // ─── Knowledge bases ──────────────────────────────────────────
  const knowledgeBases = [
    { key: "helpCenter", name: "Help Center", color: "black" },
    { key: "itRunbooks", name: "IT Runbooks", color: "yellow" },
    { key: "onboarding", name: "Onboarding SOPs", color: "blue" },
    { key: "billing", name: "Billing FAQ", color: "green" },
  ];

  // ─── The documents the demo story is about ────────────────────
  const featured = [
    // Fix first table
    {
      key: "resetPassword",
      title: "Reset your password",
      kb: "helpCenter",
      type: "KB Article",
      owner: "Mimi B.",
      reviewedDaysAgo: 420,
      negativeFeedback: 9,
      missingInfo: true,
      businessImpact: "critical",
      note: "missing SSO steps",
    },
    {
      key: "vpn",
      title: "VPN connection troubleshooting",
      kb: "itRunbooks",
      type: "Runbook",
      owner: "A. Chen",
      reviewedDaysAgo: 255,
      negativeFeedback: 9,
      missingInfo: true,
      businessImpact: "critical",
      note: "9 negative ratings",
    },
    {
      key: "payment",
      title: "Update a payment method",
      kb: "billing",
      type: "KB Article",
      owner: "M. Lee",
      reviewedDaysAgo: 180,
      negativeFeedback: 14,
      missingInfo: true,
      businessImpact: "high",
      note: "high business impact",
    },
    {
      key: "laptop",
      title: "New hire laptop setup",
      kb: "onboarding",
      type: "SOP",
      owner: "D. Patel",
      reviewedDaysAgo: 330,
      negativeFeedback: 6,
      missingInfo: true,
      businessImpact: "high",
      note: "outdated screenshots",
    },
    {
      key: "exportReport",
      title: "Export a monthly report",
      kb: "helpCenter",
      type: "KB Article",
      owner: "Mimi B.",
      reviewedDaysAgo: null,
      negativeFeedback: 8,
      missingInfo: false,
      businessImpact: "high",
      note: "no linked doc yet",
    },

    // Fixes waiting to be verified
    {
      key: "twoFactor",
      title: "Two-factor setup guide",
      kb: "helpCenter",
      type: "Guide",
      owner: "Mimi B.",
      reviewedDaysAgo: 14,
      negativeFeedback: 0,
      missingInfo: false,
      businessImpact: "medium",
    },
    {
      key: "printer",
      title: "Printer driver installation",
      kb: "itRunbooks",
      type: "Runbook",
      owner: "J. Rivera",
      reviewedDaysAgo: 20,
      negativeFeedback: 1,
      missingInfo: false,
      businessImpact: "medium",
    },
    {
      key: "refund",
      title: "Request a refund",
      kb: "billing",
      type: "KB Article",
      owner: "M. Lee",
      reviewedDaysAgo: 3,
      negativeFeedback: 0,
      missingInfo: false,
      businessImpact: "medium",
    },

    // Fixes already verified (resolved in the last 14 days)
    {
      key: "signOut",
      title: "Sign out of all devices",
      kb: "helpCenter",
      type: "KB Article",
      owner: "S. Kim",
      reviewedDaysAgo: 1,
      negativeFeedback: 0,
      missingInfo: false,
      businessImpact: "low",
    },
    {
      key: "pin",
      title: "Reset a forgotten PIN",
      kb: "itRunbooks",
      type: "Runbook",
      owner: "J. Rivera",
      reviewedDaysAgo: 4,
      negativeFeedback: 0,
      missingInfo: false,
      businessImpact: "medium",
    },
    {
      key: "badge",
      title: "Request a name badge",
      kb: "onboarding",
      type: "SOP",
      owner: "D. Patel",
      reviewedDaysAgo: 6,
      negativeFeedback: 0,
      missingInfo: false,
      businessImpact: "low",
    },
    {
      key: "unsubscribe",
      title: "Unsubscribe from emails",
      kb: "helpCenter",
      type: "KB Article",
      owner: "S. Kim",
      reviewedDaysAgo: 8,
      negativeFeedback: 0,
      missingInfo: false,
      businessImpact: "low",
    },
    {
      key: "workEmail",
      title: "Set up your work email",
      kb: "onboarding",
      type: "SOP",
      owner: "Mimi B.",
      reviewedDaysAgo: 10,
      negativeFeedback: 0,
      missingInfo: false,
      businessImpact: "medium",
    },
    {
      key: "upgrade",
      title: "Upgrade your plan",
      kb: "billing",
      type: "KB Article",
      owner: "M. Lee",
      reviewedDaysAgo: 12,
      negativeFeedback: 0,
      missingInfo: false,
      businessImpact: "medium",
    },
  ];

  // ─── Everyday documents that fill out each knowledge base ─────
  // `reviewedRecently` = how many were reviewed in the last 90 days
  const fillers = {
    helpCenter: {
      reviewedRecently: 33,
      type: "KB Article",
      titles: [
        "Change your email address",
        "Update your profile photo",
        "Set up notifications",
        "Invite a teammate",
        "Remove a teammate",
        "Change your display name",
        "Manage connected apps",
        "Download your data",
        "Delete your account",
        "Use keyboard shortcuts",
        "Search tips and filters",
        "Create a shared workspace",
        "Leave a workspace",
        "Set your time zone",
        "Change your language",
        "Turn on dark mode",
        "Set up single sign-on",
        "Recover a locked account",
        "Sign in with Google",
        "Sign in on a new device",
        "Manage active sessions",
        "Set up email forwarding",
        "Import contacts from CSV",
        "Export contacts",
        "Merge duplicate contacts",
        "Create a custom field",
        "Tag and organize records",
        "Bulk edit records",
        "Restore deleted items",
        "View change history",
        "Share a report",
        "Schedule a report",
        "Create a dashboard",
        "Embed a dashboard",
        "Connect Slack",
        "Connect Google Calendar",
        "Connect Microsoft Teams",
        "Use the mobile app",
        "Enable offline mode",
        "Report a bug",
        "Request a feature",
        "Contact support",
        "Check system status",
        "Understand usage limits",
        "Manage email preferences",
        "Accessibility settings",
        "Use templates",
        "Duplicate a project",
        "Archive a project",
      ],
    },
    itRunbooks: {
      reviewedRecently: 8,
      type: "Runbook",
      titles: [
        "Wi-Fi connection troubleshooting",
        "Configure email on mobile",
        "Install approved software",
        "Request admin access",
        "Rotate service account keys",
        "Restart a frozen application",
        "Map a network drive",
        "Set up a second monitor",
        "Fix audio in video calls",
        "Update the operating system",
        "Encrypt a laptop disk",
        "Back up a workstation",
        "Restore files from backup",
        "Replace a lost device",
        "Report a phishing email",
        "Unlock a disabled account",
        "Set up VPN on mobile",
        "Clear the browser cache",
        "Fix calendar sync issues",
        "Troubleshoot a slow laptop",
        "Configure a conference room",
        "Grant shared drive access",
        "Revoke access for leavers",
        "Patch management schedule",
        "Incident escalation runbook",
        "On-call handoff checklist",
        "Password manager setup",
        "Remote desktop access",
      ],
    },
    onboarding: {
      reviewedRecently: 11,
      type: "SOP",
      titles: [
        "First day checklist",
        "Benefits enrollment",
        "Payroll setup",
        "Order office equipment",
        "Meet your onboarding buddy",
        "Company tools overview",
        "Security awareness training",
        "Set up direct deposit",
        "Request building access",
        "Expense policy basics",
        "Time-off requests",
        "Org chart walkthrough",
        "30-60-90 day plan",
        "Join team channels",
        "Code of conduct",
        "Book a desk",
        "Parking and commuting",
        "Emergency contacts form",
        "Contractor onboarding",
      ],
    },
    billing: {
      reviewedRecently: 16,
      type: "KB Article",
      titles: [
        "Download an invoice",
        "Change the billing contact",
        "Update tax information",
        "Understand your bill",
        "Switch to annual billing",
        "Cancel a subscription",
        "Pause a subscription",
        "Apply a discount code",
        "Add a seat",
        "Remove a seat",
        "Pay by bank transfer",
        "Change your currency",
        "Billing for nonprofits",
        "Usage-based charges explained",
        "Request a W-9",
        "Proration explained",
        "Payment receipts",
        "Failed payment troubleshooting",
      ],
    },
  };

  const owners = [
    "Mimi B.",
    "J. Rivera",
    "A. Chen",
    "M. Lee",
    "D. Patel",
    "S. Kim",
  ];

  const fillerDocuments = Object.entries(fillers).flatMap(
    ([kb, { reviewedRecently, type, titles }]) =>
      titles.map((title, i) => {
        const recent = i < reviewedRecently;
        return {
          key: `${kb}-${i}`,
          title,
          kb,
          type,
          owner: pick(owners),
          reviewedDaysAgo: recent
            ? Math.round(between(5, 85))
            : Math.round(between(100, 390)),
          negativeFeedback: Math.floor(between(0, 4)),
          missingInfo: i % 9 === 4,
          businessImpact: random() < 0.6 ? "low" : "medium",
        };
      }),
  );

  const documents = [...featured, ...fillerDocuments].map(
    ({ reviewedDaysAgo, ...doc }) => ({
      ...doc,
      lastReviewedAt:
        reviewedDaysAgo === null ? null : daysAgo(reviewedDaysAgo),
    }),
  );

  // ─── Last 14 days of tickets, one bucket per 24 hours ─────────
  // Weekends get fewer tickets so the chart looks like a real team's week.
  const weekdayWeight = (bucket) => {
    const day = daysAgo(bucket + 0.5).getDay();
    if (day === 0) return 0.25;
    if (day === 6) return 0.35;
    return 1;
  };

  // Splits `total` tickets across buckets by weight, keeping the exact total
  const allocate = (total, buckets) => {
    const weights = buckets.map(weekdayWeight);
    const sum = weights.reduce((a, b) => a + b, 0);
    const raw = weights.map((w) => (total * w) / sum);
    const counts = raw.map(Math.floor);
    let left = total - counts.reduce((a, b) => a + b, 0);
    raw
      .map((value, i) => ({ i, remainder: value - Math.floor(value) }))
      .sort((a, b) => b.remainder - a.remainder)
      .forEach(({ i }) => {
        if (left > 0) {
          counts[i] += 1;
          left -= 1;
        }
      });
    return counts;
  };

  // Hands out a week's tickets: each label gets its quota, each bucket its count
  const fillWeek = (buckets, quotas) => {
    const labels = Object.entries(quotas).flatMap(([label, count]) =>
      Array(count).fill(label),
    );
    for (let i = labels.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [labels[i], labels[j]] = [labels[j], labels[i]];
    }
    const counts = allocate(labels.length, buckets);
    const dates = buckets.flatMap((bucket, i) =>
      Array.from({ length: counts[i] }, () =>
        daysAgo(bucket + between(0.05, 0.95)),
      ),
    );
    return labels.map((label, i) => ({ label, date: dates[i] }));
  };

  // 38 tickets this week, 46 the week before (↓ 17%)
  const thisWeek = fillWeek([0, 1, 2, 3, 4, 5, 6], {
    resetPassword: 7,
    twoFactor: 6,
    vpn: 5,
    payment: 4,
    laptop: 3,
    exportReport: 2,
    unlinked: 11,
  });
  const lastWeek = fillWeek([7, 8, 9, 10, 11, 12, 13], {
    resetPassword: 8,
    twoFactor: 8,
    vpn: 6,
    payment: 5,
    laptop: 3,
    exportReport: 2,
    unlinked: 14,
  });
  const recentTickets = [...thisWeek, ...lastWeek];
  const recentFor = (label) =>
    recentTickets.filter((t) => t.label === label).map((t) => t.date);

  // ─── Support issues ───────────────────────────────────────────
  const linkedIssues = [
    {
      doc: "resetPassword",
      title: "Password reset fails for SSO users",
      rootCause: "outdated_documentation",
      occurrences: [...recentFor("resetPassword"), ...spread(27, 88, 15)],
    },
    {
      doc: "vpn",
      title: "VPN disconnects every few minutes",
      rootCause: "missing_documentation",
      occurrences: [...recentFor("vpn"), ...spread(20, 87, 15)],
    },
    {
      doc: "payment",
      title: "Card update shows an error",
      rootCause: "confusing_documentation",
      occurrences: [...recentFor("payment"), ...spread(15, 86, 15)],
    },
    {
      doc: "laptop",
      title: "New hires can't finish laptop setup",
      rootCause: "outdated_documentation",
      occurrences: [...recentFor("laptop"), ...spread(11, 85, 15)],
    },
    {
      doc: "exportReport",
      title: "How do I export a monthly report?",
      rootCause: "missing_documentation",
      occurrences: [...recentFor("exportReport"), ...spread(7, 80, 15)],
    },

    // Two-factor fix: 38 tickets in the 14 days before, 14 in the 14 days after
    {
      doc: "twoFactor",
      title: "Locked out after enabling two-factor",
      rootCause: "outdated_documentation",
      status: "monitoring",
      occurrences: [...spread(38, 27.9, 14.1), ...recentFor("twoFactor")],
    },
    // Printer fix (20 days ago): 12 before, 5 after
    {
      doc: "printer",
      title: "Printer driver install fails",
      rootCause: "outdated_documentation",
      status: "monitoring",
      occurrences: [...spread(12, 33.8, 20.2), ...spread(5, 19.8, 14.2)],
    },
    {
      doc: "refund",
      title: "Refund request form is confusing",
      rootCause: "confusing_documentation",
      status: "monitoring",
      occurrences: spread(6, 40, 15),
    },

    {
      doc: "signOut",
      title: "Can't sign out on shared computers",
      rootCause: "user_education",
      status: "closed",
      occurrences: spread(5, 45, 15),
    },
    {
      doc: "pin",
      title: "PIN reset steps missing",
      rootCause: "missing_documentation",
      status: "closed",
      occurrences: spread(6, 50, 15),
    },
    {
      doc: "badge",
      title: "Badge requests go to the wrong team",
      rootCause: "outdated_documentation",
      status: "closed",
      occurrences: spread(4, 40, 16),
    },
    {
      doc: "unsubscribe",
      title: "Unsubscribe link not found",
      rootCause: "confusing_documentation",
      status: "closed",
      occurrences: spread(5, 55, 18),
    },
    {
      doc: "workEmail",
      title: "Work email setup skips MFA step",
      rootCause: "outdated_documentation",
      status: "closed",
      occurrences: spread(7, 60, 20),
    },
    {
      doc: "upgrade",
      title: "Plan upgrade price unclear",
      rootCause: "confusing_documentation",
      status: "closed",
      occurrences: spread(4, 45, 22),
    },
  ];

  // 12 issues nobody has connected to a document yet
  const unlinkedTitles = [
    ["Dashboard loads slowly in Safari", "product_bug"],
    ["Can't find where to change invoice address", "missing_documentation"],
    ["CSV import rejects large files", "product_limitation"],
    ["Notification emails arrive late", "product_bug"],
    ["How do I give a contractor read-only access?", "missing_documentation"],
    ["Calendar invites show the wrong time zone", "product_bug"],
    ["Where are archived projects?", "user_education"],
    ["Bulk delete is not available", "product_limitation"],
    ["Mobile app logs out randomly", "product_bug"],
    ["How do I share a report externally?", "user_education"],
    ["Report totals don't match the export", "confusing_documentation"],
    ["Can't add more than 50 tags", "product_limitation"],
  ];
  const unlinkedRecent = recentFor("unlinked");
  const unlinkedIssues = unlinkedTitles.map(([title, rootCause], i) => ({
    doc: null,
    title,
    rootCause,
    occurrences: [
      ...unlinkedRecent.filter((_, j) => j % unlinkedTitles.length === i),
      daysAgo(between(20, 80)),
    ],
  }));

  const issues = [...linkedIssues, ...unlinkedIssues];

  // ─── Knowledge gaps ───────────────────────────────────────────
  const gap = (doc, title, rootCause, extra) => ({
    doc,
    title,
    rootCause,
    ...extra,
  });
  const fix = (resolvedDaysAgo, fixDays, verified) => ({
    status: "resolved",
    resolvedAt: daysAgo(resolvedDaysAgo),
    createdAt: daysAgo(resolvedDaysAgo + fixDays),
    ...(verified && {
      verifiedAt: daysAgo(Math.max(resolvedDaysAgo - 0.5, 0.1)),
    }),
  });

  const gaps = [
    // Open work
    gap(
      "resetPassword",
      "Reset steps don't cover SSO accounts",
      "outdated_documentation",
      {
        recommendedAction: "update_existing",
        priority: "critical",
        status: "in_progress",
        assignee: "Mimi B.",
        createdAt: daysAgo(6),
      },
    ),
    gap(
      "vpn",
      "No troubleshooting for frequent disconnects",
      "missing_documentation",
      {
        recommendedAction: "update_existing",
        priority: "critical",
        status: "open",
        createdAt: daysAgo(4),
      },
    ),
    gap(
      "payment",
      "Card update error messages aren't explained",
      "confusing_documentation",
      {
        recommendedAction: "clarify",
        priority: "high",
        status: "in_review",
        assignee: "M. Lee",
        createdAt: daysAgo(9),
      },
    ),
    gap(
      "laptop",
      "Screenshots show the old setup wizard",
      "outdated_documentation",
      {
        recommendedAction: "update_existing",
        priority: "high",
        status: "open",
        assignee: "D. Patel",
        createdAt: daysAgo(5),
      },
    ),
    gap(
      "exportReport",
      "No article for exporting monthly reports",
      "missing_documentation",
      {
        recommendedAction: "create_new",
        priority: "medium",
        status: "open",
        createdAt: daysAgo(3),
      },
    ),

    // Fixes waiting to be verified
    gap(
      "twoFactor",
      "Two-factor guide missing authenticator app steps",
      "outdated_documentation",
      {
        recommendedAction: "update_existing",
        priority: "high",
        assignee: "Mimi B.",
        ...fix(14, 2, false),
      },
    ),
    gap(
      "printer",
      "Driver version in the guide is out of date",
      "outdated_documentation",
      {
        recommendedAction: "update_existing",
        priority: "medium",
        assignee: "J. Rivera",
        ...fix(20, 3, false),
      },
    ),
    gap(
      "refund",
      "Refund steps are hard to follow",
      "confusing_documentation",
      {
        recommendedAction: "clarify",
        priority: "medium",
        assignee: "M. Lee",
        ...fix(3, 2.5, false),
      },
    ),

    // Fixes already verified
    gap(
      "signOut",
      "Sign-out steps missing for shared computers",
      "user_education",
      {
        recommendedAction: "clarify",
        priority: "low",
        assignee: "S. Kim",
        ...fix(1, 1, true),
      },
    ),
    gap("pin", "No steps for forgotten PINs", "missing_documentation", {
      recommendedAction: "create_new",
      priority: "medium",
      assignee: "J. Rivera",
      ...fix(4, 2, true),
    }),
    gap("badge", "Badge request routing changed", "outdated_documentation", {
      recommendedAction: "update_existing",
      priority: "low",
      assignee: "D. Patel",
      ...fix(6, 2, true),
    }),
    gap(
      "unsubscribe",
      "Unsubscribe link location unclear",
      "confusing_documentation",
      {
        recommendedAction: "clarify",
        priority: "low",
        assignee: "S. Kim",
        ...fix(8, 3, true),
      },
    ),
    gap(
      "workEmail",
      "Work email guide skips the MFA step",
      "outdated_documentation",
      {
        recommendedAction: "update_existing",
        priority: "medium",
        assignee: "Mimi B.",
        ...fix(10, 3, true),
      },
    ),
    gap(
      "upgrade",
      "Upgrade pricing explanation unclear",
      "confusing_documentation",
      {
        recommendedAction: "clarify",
        priority: "medium",
        assignee: "M. Lee",
        ...fix(12, 3.3, true),
      },
    ),
  ];

  return { knowledgeBases, documents, issues, gaps };
};
