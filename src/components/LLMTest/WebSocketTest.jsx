import React, { useEffect, useRef, useState } from "react";
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
export default function WebSocketTest() {
  const [connected, setConnected] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // {role:'user'|'bot', text, streaming?, id?}
  const [isStreaming, setIsStreaming] = useState(false);
  const [threadId, setThreadId] = useState(() => uuidv4()); // session-level thread id (optional)
  const [allowConcurrentRuns, setAllowConcurrentRuns] = useState(false);

  const wsRef = useRef(null);
  const hostRef = useRef({}); // stores reconnect/backoff state
  hostRef.current.shouldReconnect = true;
  hostRef.current.retries = 0;

  const outgoingQueueRef = useRef([]); // if socket down, queue messages
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const PORT = 8000;
  const WS_PATH = "/ws/promotion_chat";

  // --- Connect function with exponential backoff ---
  const connect = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname || "localhost";
    const url = `${protocol}//${host}:${PORT}${WS_PATH}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("ws open");
      hostRef.current.retries = 0;
      setConnected(true);

      // flush queued messages
      if (outgoingQueueRef.current.length > 0) {
        outgoingQueueRef.current.forEach((m) => ws.send(m));
        outgoingQueueRef.current = [];
      }
    };

    ws.onmessage = (evt) => {
      let msg;
      try {
        msg = JSON.parse(evt.data);
      } catch (err) {
        console.error("Invalid WS message (non-JSON):", evt.data);
        return;
      }

      // Handle different message types from backend
      if (msg.type === "token") {
        const tokenText = String(msg.text ?? "");
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === "bot" && last.streaming) {
            const copy = [...prev];
            copy[copy.length - 1] = { ...last, text: last.text + tokenText };
            return copy;
          }
          return [...prev, { role: "bot", text: tokenText, streaming: true, id: uuidv4() }];
        });
        setIsStreaming(true);
      } else if (msg.type === "event") {
        // Extract text from event data
        const data = msg.data;
        let text = "";
        
        if (typeof data === "string") {
          text = data;
        } else if (data && typeof data === "object") {
          // Try to extract text from various possible fields
          text = data.text || data.content || data.message || JSON.stringify(data);
        } else {
          text = String(data ?? "");
        }

        if (text) {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === "bot" && last.streaming) {
              const copy = [...prev];
              copy[copy.length - 1] = { ...last, text: last.text + text };
              return copy;
            }
            return [...prev, { role: "bot", text, streaming: true, id: uuidv4() }];
          });
          setIsStreaming(true);
        }
      } else if (msg.type === "done") {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === "bot" && last.streaming) {
            const copy = [...prev];
            copy[copy.length - 1] = { ...last, streaming: false };
            return copy;
          }
          return prev;
        });
        setIsStreaming(false);
      } else if (msg.type === "error") {
        const detail = msg.detail ?? "Unknown error from server";
        setMessages((prev) => [...prev, { role: "bot", text: `Error: ${detail}`, streaming: false, id: uuidv4() }]);
        setIsStreaming(false);
      } else {
        // Unknown message type
        console.warn("Unknown message type:", msg);
      }

      scrollToBottom();
    };

    ws.onclose = (e) => {
      console.log("ws closed", e);
      setConnected(false);
      if (hostRef.current.shouldReconnect) {
        const nextRetry = Math.min(30_000, 500 * Math.pow(2, hostRef.current.retries));
        hostRef.current.retries += 1;
        console.log(`Reconnecting in ${nextRetry}ms`);
        setTimeout(() => connect(), nextRetry);
      }
    };

    ws.onerror = (e) => {
      console.error("ws error", e);
    };
  };

  useEffect(() => {
    hostRef.current.shouldReconnect = true;
    connect();

    return () => {
      hostRef.current.shouldReconnect = false;
      try {
        wsRef.current && wsRef.current.close();
      } catch (err) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const sendMessage = (text = null) => {
    const messageText = (text ?? input).trim();
    if (!messageText) return;

    if (isStreaming && !allowConcurrentRuns) {
      setMessages((prev) => [...prev, { role: "bot", text: "Please wait for current response to finish.", streaming: false, id: uuidv4() }]);
      setInput("");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text: messageText, id: uuidv4() }]);
    setInput("");

    const outgoing = JSON.stringify({ message: messageText, thread_id: threadId });

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(outgoing);
        setIsStreaming(true);
      } catch (err) {
        console.error("Send failed, queueing", err);
        outgoingQueueRef.current.push(outgoing);
      }
    } else {
      outgoingQueueRef.current.push(outgoing);
      setMessages((prev) => [...prev, { role: "bot", text: "Message queued — connecting to server...", streaming: false, id: uuidv4() }]);
      if (!connected) {
        connect();
      }
    }
  };
  
  const scrollToBottom = () => {
    try {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      } else if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    } catch (err) {
      // ignore
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetThread = () => {
    setThreadId(uuidv4());
    setMessages([]);
    setIsStreaming(false);
  };

  const statusBadge = connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <h1 className="text-xl font-semibold">Realtime WebSocket Chat</h1>

          <div className={`px-3 py-1 rounded-full text-sm ${statusBadge}`}>{connected ? "connected" : "disconnected"}</div>

          <div className="text-xs text-gray-600 truncate max-w-xs">
            <span className="font-mono">thread_id: </span>
            <span title={threadId}>{threadId.slice(0, 10)}…</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={resetThread}
              className="text-sm px-2 py-1 border rounded-md text-gray-700 hover:bg-gray-100"
              title="Start a new thread/conversation"
            >
              New Thread
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={allowConcurrentRuns} onChange={(e) => setAllowConcurrentRuns(e.target.checked)} />
              Allow concurrent runs
            </label>
          </div>
        </div>

        <div ref={containerRef} className="h-72 overflow-y-auto mb-4 p-3 border rounded-lg bg-gray-50">
          {messages.map((m, idx) => (
            <div key={m.id ?? idx} className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`${m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"} p-3 rounded-lg max-w-[80%]`}>
                <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                {m.streaming && <div className="text-xs italic mt-1 opacity-80">streaming…</div>}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <textarea
            rows={1}
            className="flex-1 p-3 border rounded-lg resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming && !allowConcurrentRuns ? "Waiting for current response..." : "Type a message and press Enter"}
            disabled={isStreaming && !allowConcurrentRuns}
          />
          <button
            onClick={() => sendMessage()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 disabled:hover:bg-blue-600"
            disabled={isStreaming && !allowConcurrentRuns}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}