const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxgeqI6-2E8zJrkZrlFBtFKPr3Wmc4qF9pSk8bLloFxtAU4kVjkAtnujP_zkCaKQ6Y/exec";

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

export async function fetchTodos(): Promise<TodoItem[]> {
  const res = await fetch(APPS_SCRIPT_URL);
  if (!res.ok) throw new Error("Failed to fetch todos");
  const rows: string[][] = await res.json();
  return rows
    .filter((row) => row[0])
    .map((row) => ({
      id: row[0],
      text: row[1] || "",
      done: row[2] === "TRUE",
      createdAt: row[3] || "",
    }));
}

async function post(body: Record<string, unknown>): Promise<void> {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Request failed");
}

export async function addTodo(text: string): Promise<void> {
  await post({ action: "add", id: crypto.randomUUID(), text, createdAt: new Date().toISOString() });
}

export async function toggleTodo(id: string, done: boolean): Promise<void> {
  await post({ action: "toggle", id, done });
}

export async function deleteTodo(id: string): Promise<void> {
  await post({ action: "delete", id });
}
