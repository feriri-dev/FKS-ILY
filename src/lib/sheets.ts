const API_KEY = "AIzaSyBUQam0WEm3UcMJgnjpcXsp-3iaV14zZBY";
const SHEET_ID = "1Bemdp9SF_mgk0PUaqlWiaBJXDWqDExOR0ZuvTcoANvs";
const SHEET_NAME = "Todos";

const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`;

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

// Read all todos from the sheet
export async function fetchTodos(): Promise<TodoItem[]> {
  const url = `${BASE_URL}/values/${SHEET_NAME}!A:D?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch todos");
  const data = await res.json();
  const rows: string[][] = data.values || [];
  // Skip header row
  return rows.slice(1).map((row) => ({
    id: row[0] || "",
    text: row[1] || "",
    done: row[2] === "TRUE",
    createdAt: row[3] || "",
  }));
}

// Append a new todo
export async function addTodo(text: string): Promise<void> {
  const url = `${BASE_URL}/values/${SHEET_NAME}!A:D:append?valueInputOption=RAW&key=${API_KEY}`;
  const id = crypto.randomUUID();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      values: [[id, text, "FALSE", new Date().toISOString()]],
    }),
  });
  if (!res.ok) throw new Error("Failed to add todo");
}

// Toggle a todo's done state — find row index and update
export async function toggleTodo(id: string, done: boolean): Promise<void> {
  // First find the row index
  const todos = await fetchTodos();
  const idx = todos.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error("Todo not found");
  const rowNum = idx + 2; // +1 header, +1 zero-based
  const url = `${BASE_URL}/values/${SHEET_NAME}!C${rowNum}?valueInputOption=RAW&key=${API_KEY}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ values: [[done ? "TRUE" : "FALSE"]] }),
  });
  if (!res.ok) throw new Error("Failed to toggle todo");
}

// Delete a todo by clearing the row (or we can use batchUpdate)
export async function deleteTodo(id: string): Promise<void> {
  const todos = await fetchTodos();
  const idx = todos.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error("Todo not found");
  const rowNum = idx + 2;
  const url = `${BASE_URL}/values/${SHEET_NAME}!A${rowNum}:D${rowNum}?valueInputOption=RAW&key=${API_KEY}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ values: [["", "", "", ""]] }),
  });
  if (!res.ok) throw new Error("Failed to delete todo");
}
