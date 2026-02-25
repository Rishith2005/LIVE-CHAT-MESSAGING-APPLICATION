"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/components/ui/utils";
import { ConversationItem } from "@/components/chat/conversation-item";
import { StatusIndicator } from "@/components/chat/status-indicator";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { EmptyState } from "@/components/system/empty-state";
import { MessageSkeleton } from "@/components/chat/message-skeleton";
import { ConversationSkeleton } from "@/components/chat/conversation-skeleton";
import { DeleteConfirmationDialog } from "@/components/chat/delete-confirmation-dialog";
import { ProfileDrawer } from "@/components/chat/profile-drawer";
import { EmojiPicker } from "@/components/chat/emoji-picker";
import { isClerkConfigured, isConvexConfigured } from "@/lib/env";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
  demoConversations,
  demoCurrentUser,
  demoMessages,
  demoUsers,
  type Message,
} from "@/lib/mock";
import { formatListTimestamp, formatMessageTime } from "@/lib/format";
import { ArrowLeft, Info, Send } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

type UiStatus = "sent" | "sending" | "failed";
type UiMessage = Message & { uiStatus?: UiStatus };

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

function getViewportEl(root: HTMLDivElement | null) {
  if (!root) return null;
  return root.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement | null;
}

export default function ChatPage() {
  if (isConvexConfigured()) return <ChatConvex />;
  return <ChatDemo />;
}

function ChatConvex() {
  if (isClerkConfigured()) return <ChatConvexClerk />;
  return <ChatConvexDemoAuth />;
}

function ChatConvexDemoAuth() {
  return <ChatConvexInner viewerId={demoCurrentUser.id} viewerUserId={demoCurrentUser.id} />;
}

function ChatConvexClerk() {
  const { isLoaded, user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  if (!isLoaded) return null;
  if (!user) return null;
  return (
    <ChatConvexInner
      viewerUserId={user.id}
      viewerId={isAuthenticated ? undefined : user.id}
    />
  );
}

function ChatConvexInner({
  viewerId,
  viewerUserId,
}: {
  viewerId?: string;
  viewerUserId: string;
}) {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId as Id<"conversations">;

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [newMessagesPill, setNewMessagesPill] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const typingStopTimer = useRef<number | null>(null);

  const [text, setText] = useState("");
  const [optimistic, setOptimistic] = useState<UiMessage[]>([]);

  const list = useQuery(api.conversations.listForViewer, {
    viewerId,
  });

  const conversation = useQuery(api.conversations.get, {
    conversationId,
    viewerId,
  });

  const messagesFromServer = useQuery(api.messages.list, {
    conversationId,
    viewerId,
    limit: 200,
  });

  const typingUserIds = useQuery(api.typing.list, {
    conversationId,
    viewerId,
  });

  const sendMutation = useMutation(api.messages.send);
  const deleteMutation = useMutation(api.messages.remove);
  const toggleReactionMutation = useMutation(api.messages.toggleReaction);
  const setTypingMutation = useMutation(api.typing.set);

  const peer = useMemo(() => {
    if (!conversation?.peer) return null;
    return {
      id: conversation.peer.userId,
      name: conversation.peer.name,
      email: "",
      avatarUrl: conversation.peer.imageUrl,
      status: conversation.peer.status ?? "offline",
    };
  }, [conversation]);

  type ConversationListRow = {
    conversationId: string;
    title: string;
    lastMessage?: string;
    lastMessageAt: number;
    unreadCount: number;
    peer?: {
      userId: string;
      name: string;
      imageUrl?: string;
      status?: "online" | "away" | "offline";
    };
  };

  const loadingList = list === undefined;
  const loadingMessages = messagesFromServer === undefined;

  const uiMessages = useMemo(() => {
    type ServerReaction = { emoji: string; userId: string };
    type ServerMessageRow = {
      _id: unknown;
      conversationId: unknown;
      senderId: string;
      body?: string | null;
      createdAt: number;
      deletedAt?: number | null;
      reactions?: ServerReaction[] | null;
    };

    const base: UiMessage[] = ((messagesFromServer ?? []) as unknown as ServerMessageRow[]).map((m) => {
      const emojis = Array.from(new Set(((m.reactions ?? []) as ServerReaction[]).map((r) => r.emoji)));
      return {
        id: String(m._id),
        conversationId: String(m.conversationId),
        senderId: m.senderId,
        body: m.body ?? "",
        createdAt: new Date(m.createdAt),
        isRead: false,
        isDeleted: Boolean(m.deletedAt),
        reactions: emojis,
        uiStatus: "sent",
      };
    });

    const combined = [...base, ...optimistic];
    combined.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return combined;
  }, [messagesFromServer, optimistic]);

  useEffect(() => {
    const viewport = getViewportEl(rootRef.current);
    if (!viewport) return;
    const onScroll = () => {
      const distance = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      const atBottom = distance < 32;
      setIsAtBottom(atBottom);
      if (atBottom) setNewMessagesPill(false);
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => viewport.removeEventListener("scroll", onScroll);
  }, [conversationId, loadingMessages]);

  const scrollToBottom = () => {
    const viewport = getViewportEl(rootRef.current);
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    setNewMessagesPill(false);
  };

  const startTypingPulse = () => {
    void setTypingMutation({
      conversationId,
      isTyping: true,
      viewerId,
    });

    if (typingStopTimer.current) window.clearTimeout(typingStopTimer.current);
    typingStopTimer.current = window.setTimeout(() => {
      void setTypingMutation({
        conversationId,
        isTyping: false,
        viewerId,
      });
    }, 1600);
  };

  const send = async () => {
    const body = text.trim();
    if (!body || body.length > 320) return;
    setText("");

    const tempId = uid("m");
    const optimisticMsg: UiMessage = {
      id: tempId,
      conversationId: String(conversationId),
      senderId: viewerUserId,
      body,
      createdAt: new Date(),
      isRead: false,
      uiStatus: "sending",
    };
    setOptimistic((prev) => [...prev, optimisticMsg]);

    if (isAtBottom) requestAnimationFrame(scrollToBottom);
    else setNewMessagesPill(true);

    try {
      await sendMutation({
        conversationId,
        body,
        viewerId,
      });
      setOptimistic((prev) => prev.filter((m) => m.id !== tempId));
      void setTypingMutation({
        conversationId,
        isTyping: false,
        viewerId,
      });
    } catch (e: unknown) {
      setOptimistic((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, uiStatus: "failed" } : m))
      );
      toast.error("Message failed", {
        description: e instanceof Error ? e.message : "Tap retry to resend.",
      });
    }
  };

  const retry = async (id: string) => {
    const target = optimistic.find((m) => m.id === id);
    if (!target) return;
    setOptimistic((prev) =>
      prev.map((m) => (m.id === id ? { ...m, uiStatus: "sending" } : m))
    );
    try {
      await sendMutation({
        conversationId,
        body: target.body,
        viewerId,
      });
      setOptimistic((prev) => prev.filter((m) => m.id !== id));
    } catch (e: unknown) {
      setOptimistic((prev) =>
        prev.map((m) => (m.id === id ? { ...m, uiStatus: "failed" } : m))
      );
      toast.error("Retry failed", { description: e instanceof Error ? e.message : "Try again." });
    }
  };

  const addReaction = (id: string, emoji: string) => {
    void toggleReactionMutation({
      messageId: id as Id<"messages">,
      emoji,
      viewerId,
    }).catch((e: unknown) =>
      toast.error("Reaction failed", {
        description: e instanceof Error ? e.message : "Try again.",
      })
    );
  };

  const requestDelete = (id: string) => {
    setPendingDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    void deleteMutation({ messageId: pendingDeleteId as Id<"messages">, viewerId })
      .then(() => toast.message("Message deleted"))
      .catch((e: unknown) =>
        toast.error("Delete failed", {
          description: e instanceof Error ? e.message : "Try again.",
        })
      )
      .finally(() => {
        setDeleteOpen(false);
        setPendingDeleteId(null);
      });
  };

  if (conversation === null) {
    return (
      <div className="h-full p-6">
        <EmptyState
          type="no-results"
          title="Conversation not found"
          description="Return to your inbox to choose another chat."
          actionLabel="Go to dashboard"
          onAction={() => (window.location.href = "/dashboard")}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="hidden w-[360px] border-r border-border bg-card/50 backdrop-blur md:block">
        <div className="border-b border-border p-4">
          <p className="text-sm font-semibold">Conversations</p>
          <div className="mt-3">
            <Input placeholder="Search…" aria-label="Search conversations" />
          </div>
        </div>
        <ScrollArea className="h-[calc(100dvh-64px-144px)]">
          {loadingList ? (
            <ConversationSkeleton />
          ) : (
            <div className="p-2">
              {((list ?? []) as unknown as ConversationListRow[]).map((c) => {
                const peerUser = c.peer
                  ? {
                      id: c.peer.userId,
                      name: c.peer.name,
                      email: "",
                      avatarUrl: c.peer.imageUrl,
                      status: c.peer.status ?? "offline",
                    }
                  : undefined;
                return (
                  <ConversationItem
                    key={String(c.conversationId)}
                    conversationId={String(c.conversationId)}
                    title={c.title}
                    lastMessage={c.lastMessage ?? ""}
                    timestamp={formatListTimestamp(new Date(c.lastMessageAt))}
                    unreadCount={c.unreadCount}
                    peer={peerUser}
                    active={String(c.conversationId) === String(conversationId)}
                  />
                );
              })}
            </div>
          )}
        </ScrollArea>
        <div className="border-t border-border p-4">
          <Button asChild className="w-full rounded-xl">
            <Link href="/discover">New conversation</Link>
          </Button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b border-border bg-card/60 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="rounded-full md:hidden">
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <p className="text-sm font-semibold">{conversation?.title ?? "Conversation"}</p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                {peer ? <StatusIndicator status={peer.status} size="sm" /> : null}
                <span>
                  {peer?.status === "online"
                    ? "Active now"
                    : peer?.status === "away"
                      ? "Away"
                      : "Offline"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden rounded-full lg:inline-flex"
              onClick={() => setDetailsOpen(true)}
            >
              Details
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setDetailsOpen(true)}
              aria-label="Open details"
              title="Open details"
            >
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="relative min-w-0 flex-1" ref={rootRef}>
          <ScrollArea className="h-full p-4">
            <div className="mx-auto max-w-3xl space-y-4">
              {loadingMessages ? (
                <MessageSkeleton />
              ) : uiMessages.length === 0 ? (
                <div className="h-[60vh]">
                  <EmptyState
                    type="no-messages"
                    title="No messages yet"
                    description="Send the first message to start the conversation."
                  />
                </div>
              ) : (
                uiMessages.map((m) => {
                  const sender = m.senderId === viewerUserId;
                  const canDelete = sender && !m.isDeleted && m.uiStatus !== "sending" && m.uiStatus !== "failed";
                  const canReact = !m.isDeleted && m.uiStatus !== "sending";
                  return (
                    <ChatBubble
                      key={m.id}
                      body={m.body}
                      timestamp={formatMessageTime(m.createdAt)}
                      sender={sender}
                      read={m.isRead}
                      deleted={m.isDeleted}
                      reactions={m.reactions}
                      status={m.uiStatus}
                      onRetry={m.uiStatus === "failed" ? () => retry(m.id) : undefined}
                      onDelete={canDelete ? () => requestDelete(m.id) : undefined}
                      onAddReaction={canReact ? (e) => addReaction(m.id, e) : undefined}
                    />
                  );
                })
              )}

              {(typingUserIds?.length ?? 0) > 0 && !loadingMessages ? <TypingIndicator /> : null}
            </div>
          </ScrollArea>

          {newMessagesPill ? (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <Button variant="secondary" className="rounded-full shadow-md" onClick={scrollToBottom}>
                New messages
              </Button>
            </div>
          ) : null}
        </div>

        <div className="border-t border-border bg-card/60 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <EmojiPicker onSelect={(e) => setText((v) => `${v}${e}`)} />
            <div className="min-w-0 flex-1">
              <Textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  startTypingPulse();
                }}
                placeholder="Type a message…"
                className="max-h-36"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <div className="mt-2 flex items-center justify-between px-1">
                <span className="text-xs text-muted-foreground">Enter to send • Shift+Enter for newline</span>
                <span className={cn("text-xs", text.trim().length > 320 ? "text-destructive" : "text-muted-foreground")}>
                  {text.trim().length}/320
                </span>
              </div>
            </div>
            <Button
              size="icon"
              className="h-11 w-11 rounded-full"
              onClick={() => void send()}
              disabled={!text.trim() || text.trim().length > 320}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className={cn("hidden w-80 border-l border-border bg-card/50 backdrop-blur", detailsOpen ? "xl:block" : "xl:hidden")}>
        <div className="border-b border-border p-4">
          <p className="text-sm font-semibold">Details</p>
        </div>
        <div className="p-4">
          <EmptyState
            type="inbox-zero"
            title="Open profile"
            description="Use the info button to view profile on mobile."
          />
        </div>
      </div>

      <ProfileDrawer open={detailsOpen} onOpenChange={setDetailsOpen} user={peer} />
      <DeleteConfirmationDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={confirmDelete} />
    </div>
  );
}

function ChatDemo() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId;

  const [loadingList] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [typing, setTyping] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [newMessagesPill, setNewMessagesPill] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const [messageState, setMessageState] = useState<Record<string, UiMessage[]>>(() => {
    const next: Record<string, UiMessage[]> = {};
    for (const [k, v] of Object.entries(demoMessages)) {
      next[k] = v.map((m) => ({ ...m, uiStatus: "sent" }));
    }
    return next;
  });

  const [text, setText] = useState("");

  const conversation = demoConversations.find((c) => c.id === conversationId) || null;

  const peer = useMemo(() => {
    if (!conversation) return null;
    const other = conversation.participantIds.find((id) => id !== demoCurrentUser.id);
    return demoUsers.find((u) => u.id === other) || null;
  }, [conversation]);

  const messages = messageState[conversationId] || [];

  useEffect(() => {
    let active = true;
    const t1 = setTimeout(() => {
      if (active) setLoadingMessages(true);
    }, 0);
    const t2 = setTimeout(() => {
      if (active) setLoadingMessages(false);
    }, 450);
    return () => {
      active = false;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [conversationId]);

  useEffect(() => {
    const viewport = getViewportEl(rootRef.current);
    if (!viewport) return;
    const onScroll = () => {
      const distance = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      const atBottom = distance < 32;
      setIsAtBottom(atBottom);
      if (atBottom) setNewMessagesPill(false);
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => viewport.removeEventListener("scroll", onScroll);
  }, [conversationId, loadingMessages]);

  const scrollToBottom = () => {
    const viewport = getViewportEl(rootRef.current);
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    setNewMessagesPill(false);
  };

  const send = async () => {
    const body = text.trim();
    if (!body || !conversation) return;
    setText("");
    const optimistic: UiMessage = {
      id: uid("m"),
      conversationId: conversation.id,
      senderId: demoCurrentUser.id,
      body,
      createdAt: new Date(),
      isRead: false,
      uiStatus: "sending",
    };
    setMessageState((prev) => ({
      ...prev,
      [conversation.id]: [...(prev[conversation.id] || []), optimistic],
    }));

    if (isAtBottom) requestAnimationFrame(scrollToBottom);
    else setNewMessagesPill(true);

    await new Promise((r) => setTimeout(r, 650));
    const shouldFail = body.toLowerCase().includes("fail") || Math.random() < 0.12;
    setMessageState((prev) => {
      const list = prev[conversation.id] || [];
      return {
        ...prev,
        [conversation.id]: list.map((m) =>
          m.id === optimistic.id ? { ...m, uiStatus: shouldFail ? "failed" : "sent" } : m
        ),
      };
    });
    if (shouldFail) {
      toast.error("Message failed", { description: "Tap retry to resend." });
      return;
    }

    setTyping(true);
    setTimeout(() => setTyping(false), 1100);
  };

  const retry = async (id: string) => {
    if (!conversation) return;
    setMessageState((prev) => {
      const list = prev[conversation.id] || [];
      return {
        ...prev,
        [conversation.id]: list.map((m) => (m.id === id ? { ...m, uiStatus: "sending" } : m)),
      };
    });
    await new Promise((r) => setTimeout(r, 650));
    setMessageState((prev) => {
      const list = prev[conversation.id] || [];
      return {
        ...prev,
        [conversation.id]: list.map((m) => (m.id === id ? { ...m, uiStatus: "sent" } : m)),
      };
    });
    toast.success("Resent", { description: "Message delivered." });
  };

  const addReaction = (id: string, emoji: string) => {
    if (!conversation) return;
    setMessageState((prev) => {
      const list = prev[conversation.id] || [];
      return {
        ...prev,
        [conversation.id]: list.map((m) => {
          if (m.id !== id) return m;
          const curr = m.reactions || [];
          return curr.includes(emoji) ? m : { ...m, reactions: [...curr, emoji] };
        }),
      };
    });
  };

  const requestDelete = (id: string) => {
    setPendingDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!conversation || !pendingDeleteId) return;
    setMessageState((prev) => {
      const list = prev[conversation.id] || [];
      return {
        ...prev,
        [conversation.id]: list.map((m) => (m.id === pendingDeleteId ? { ...m, isDeleted: true } : m)),
      };
    });
    setDeleteOpen(false);
    setPendingDeleteId(null);
    toast.message("Message deleted");
  };

  if (!conversation) {
    return (
      <div className="h-full p-6">
        <EmptyState
          type="no-results"
          title="Conversation not found"
          description="Return to your inbox to choose another chat."
          actionLabel="Go to dashboard"
          onAction={() => (window.location.href = "/dashboard")}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="hidden w-[360px] border-r border-border bg-card/50 backdrop-blur md:block">
        <div className="border-b border-border p-4">
          <p className="text-sm font-semibold">Conversations</p>
          <div className="mt-3">
            <Input placeholder="Search…" aria-label="Search conversations" />
          </div>
        </div>
        <ScrollArea className="h-[calc(100dvh-64px-144px)]">
          {loadingList ? (
            <ConversationSkeleton />
          ) : (
            <div className="p-2">
              {demoConversations.map((c) => {
                const peer = demoUsers.find((u) => u.name === c.title);
                return (
                  <ConversationItem
                    key={c.id}
                    conversationId={c.id}
                    title={c.title}
                    lastMessage={c.lastMessage}
                    timestamp={formatListTimestamp(c.lastMessageAt)}
                    unreadCount={c.unreadCount}
                    peer={peer}
                    active={c.id === conversationId}
                  />
                );
              })}
            </div>
          )}
        </ScrollArea>
        <div className="border-t border-border p-4">
          <Button asChild className="w-full rounded-xl">
            <Link href="/discover">New conversation</Link>
          </Button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b border-border bg-card/60 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="rounded-full md:hidden">
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <p className="text-sm font-semibold">{conversation.title}</p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                {peer ? <StatusIndicator status={peer.status} size="sm" /> : null}
                <span>{peer?.status === "online" ? "Active now" : peer?.status === "away" ? "Away" : "Offline"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden rounded-full lg:inline-flex" onClick={() => setDetailsOpen(true)}>
              Details
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setDetailsOpen(true)}>
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="relative min-w-0 flex-1" ref={rootRef}>
          <ScrollArea className="h-full p-4">
            <div className="mx-auto max-w-3xl space-y-4">
              {loadingMessages ? (
                <MessageSkeleton />
              ) : messages.length === 0 ? (
                <div className="h-[60vh]">
                  <EmptyState
                    type="no-messages"
                    title="No messages yet"
                    description="Send the first message to start the conversation."
                  />
                </div>
              ) : (
                messages.map((m) => {
                  const sender = m.senderId === demoCurrentUser.id;
                  return (
                    <ChatBubble
                      key={m.id}
                      body={m.body}
                      timestamp={formatMessageTime(m.createdAt)}
                      sender={sender}
                      read={m.isRead}
                      deleted={m.isDeleted}
                      reactions={m.reactions}
                      status={m.uiStatus}
                      onRetry={m.uiStatus === "failed" ? () => retry(m.id) : undefined}
                      onDelete={sender && !m.isDeleted ? () => requestDelete(m.id) : undefined}
                      onAddReaction={!m.isDeleted && m.uiStatus !== "sending" ? (e) => addReaction(m.id, e) : undefined}
                    />
                  );
                })
              )}

              {typing && !loadingMessages ? <TypingIndicator /> : null}
            </div>
          </ScrollArea>

          {newMessagesPill ? (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <Button variant="secondary" className="rounded-full shadow-md" onClick={scrollToBottom}>
                New messages
              </Button>
            </div>
          ) : null}
        </div>

        <div className="border-t border-border bg-card/60 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <EmojiPicker onSelect={(e) => setText((v) => `${v}${e}`)} />
            <div className="min-w-0 flex-1">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
                className="max-h-36"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <div className="mt-2 flex items-center justify-between px-1">
                <span className="text-xs text-muted-foreground">Enter to send • Shift+Enter for newline</span>
                <span className={cn("text-xs", text.trim().length > 320 ? "text-destructive" : "text-muted-foreground")}>
                  {text.trim().length}/320
                </span>
              </div>
            </div>
            <Button
              size="icon"
              className="h-11 w-11 rounded-full"
              onClick={() => void send()}
              disabled={!text.trim() || text.trim().length > 320}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className={cn("hidden w-80 border-l border-border bg-card/50 backdrop-blur", detailsOpen ? "xl:block" : "xl:hidden")}>
        <div className="border-b border-border p-4">
          <p className="text-sm font-semibold">Details</p>
        </div>
        <div className="p-4">
          <EmptyState
            type="inbox-zero"
            title="Open profile"
            description="Use the info button to view profile on mobile."
          />
        </div>
      </div>

      <ProfileDrawer open={detailsOpen} onOpenChange={setDetailsOpen} user={peer} />
      <DeleteConfirmationDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={confirmDelete} />
    </div>
  );
}

