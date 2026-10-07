import { createApiClient } from "@/lib/api";

const chatApi = createApiClient("/master-data/chat");

export class ChatServiceError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "ChatServiceError"
    this.status = status
  }
}

/**
 * Sends a user message + conversationId to the internal Next.js API route,
 * which proxies it to the ACS backend.
 */
export async function sendChatMessage(
  message: string,
  conversationId: string,
  signal?: AbortSignal
): Promise<ChatApiResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, conversationId }),
    signal,
  })

  let data: ChatApiResponse
  try {
    data = await response.json()
    
  } catch {
    throw new ChatServiceError("Respons server tidak valid", response.status)
  }

  if (!response.ok || !data.success) {
    throw new ChatServiceError(
      data.error || `Permintaan gagal (status ${response.status})`,
      response.status
    )
  }

  return data
}

export async function saveSession(id: string, title: string, conversation: any[]) {
  try {
    const res = await chatApi.post("/sessions", { id, title, conversation });
    return res.data;
  } catch (err: any) {
    console.error("Failed to save session:", err);
  }
}

export async function getSessions() {
  try {
    const res = await chatApi.get("/sessions");
    return res.data?.data || [];
  } catch (err: any) {
    console.error("Failed to fetch sessions:", err);
    return [];
  }
}

export async function getSessionById(id: string) {
  try {
    const res = await chatApi.get(`/sessions/${id}`);
    return res.data?.data || null;
  } catch (err: any) {
    console.error("Failed to fetch session by id:", err);
    return null;
  }
}

export async function deleteSession(id: string) {
  try {
    const res = await chatApi.delete(`/sessions/${id}`);
    return res.data;
  } catch (err: any) {
    console.error("Failed to delete session:", err);
  }
}