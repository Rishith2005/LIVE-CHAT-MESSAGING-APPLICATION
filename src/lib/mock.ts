export type UserStatus = "online" | "offline" | "away";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: UserStatus;
  bio?: string;
};

export type Conversation = {
  id: string;
  type: "dm" | "room";
  title: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: Date;
  isRead: boolean;
  isDeleted?: boolean;
  reactions?: string[];
};

export const demoCurrentUser: User = {
  id: "demo-current",
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  avatarUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop",
  status: "online",
  bio: "Product Designer • Coffee enthusiast",
};

export const demoUsers: User[] = [
  {
    id: "u1",
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop",
    status: "online",
    bio: "Software Engineer",
  },
  {
    id: "u2",
    name: "Michael Foster",
    email: "michael.foster@example.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop",
    status: "online",
    bio: "Frontend Developer",
  },
  {
    id: "u3",
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop",
    status: "away",
    bio: "UX Designer",
  },
  {
    id: "u4",
    name: "James Rodriguez",
    email: "james.rodriguez@example.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop",
    status: "offline",
    bio: "DevOps Engineer",
  },
  {
    id: "u5",
    name: "Nebula Design Room",
    email: "room@nebula.chat",
    status: "online",
    bio: "Room • Design reviews",
  },
];

export const demoConversations: Conversation[] = [
  {
    id: "c1",
    type: "dm",
    title: "Sarah Chen",
    participantIds: [demoCurrentUser.id, "u1"],
    lastMessage: "Want to review the latest designs?",
    lastMessageAt: new Date(Date.now() - 5 * 60000),
    unreadCount: 2,
  },
  {
    id: "c2",
    type: "dm",
    title: "Michael Foster",
    participantIds: [demoCurrentUser.id, "u2"],
    lastMessage: "Thanks for the quick review.",
    lastMessageAt: new Date(Date.now() - 42 * 60000),
    unreadCount: 0,
  },
  {
    id: "c3",
    type: "room",
    title: "Nebula Design Room",
    participantIds: [demoCurrentUser.id, "u1", "u3", "u5"],
    lastMessage: "Pinned: Updated typography scale",
    lastMessageAt: new Date(Date.now() - 2 * 3600000),
    unreadCount: 1,
  },
];

export const demoMessages: Record<string, Message[]> = {
  c1: [
    {
      id: "m1",
      conversationId: "c1",
      senderId: "u1",
      body: "Hey Alex — do you have 10 minutes to look at the new palette?",
      createdAt: new Date(Date.now() - 44 * 60000),
      isRead: true,
    },
    {
      id: "m2",
      conversationId: "c1",
      senderId: demoCurrentUser.id,
      body: "Yes. Send it over and I’ll review now.",
      createdAt: new Date(Date.now() - 41 * 60000),
      isRead: true,
      reactions: ["👍"],
    },
    {
      id: "m3",
      conversationId: "c1",
      senderId: "u1",
      body: "Want to review the latest designs?",
      createdAt: new Date(Date.now() - 5 * 60000),
      isRead: false,
    },
    {
      id: "m4",
      conversationId: "c1",
      senderId: "u1",
      body: "I also updated the spacing tokens.",
      createdAt: new Date(Date.now() - 4 * 60000),
      isRead: false,
    },
  ],
  c2: [
    {
      id: "m5",
      conversationId: "c2",
      senderId: demoCurrentUser.id,
      body: "Your last PR looks great. Nice cleanup.",
      createdAt: new Date(Date.now() - 3 * 3600000),
      isRead: true,
    },
    {
      id: "m6",
      conversationId: "c2",
      senderId: "u2",
      body: "Thanks for the quick review.",
      createdAt: new Date(Date.now() - 42 * 60000),
      isRead: true,
    },
  ],
  c3: [
    {
      id: "m7",
      conversationId: "c3",
      senderId: "u3",
      body: "I added a draft of the mobile navigation. Thoughts?",
      createdAt: new Date(Date.now() - 140 * 60000),
      isRead: true,
    },
    {
      id: "m8",
      conversationId: "c3",
      senderId: demoCurrentUser.id,
      body: "Looks good. Let’s tighten the header height to 64px.",
      createdAt: new Date(Date.now() - 128 * 60000),
      isRead: true,
    },
    {
      id: "m9",
      conversationId: "c3",
      senderId: "u5",
      body: "Pinned: Updated typography scale",
      createdAt: new Date(Date.now() - 2 * 3600000),
      isRead: false,
      isDeleted: true,
    },
  ],
};

