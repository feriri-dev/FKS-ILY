import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchTodos, addTodo, toggleTodo, deleteTodo, type TodoItem } from "@/lib/sheets";
import { toast } from "@/hooks/use-toast";

const TodoList = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const items = await fetchTodos();
      // Filter out cleared rows
      setTodos(items.filter((t) => t.id));
    } catch {
      toast({ title: "Error", description: "Could not load todos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    const text = newTodo.trim();
    if (!text) return;
    try {
      setAdding(true);
      await addTodo(text);
      setNewTodo("");
      await load();
    } catch {
      toast({ title: "Error", description: "Could not add todo", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (item: TodoItem) => {
    try {
      // Optimistic update
      setTodos((prev) => prev.map((t) => (t.id === item.id ? { ...t, done: !t.done } : t)));
      await toggleTodo(item.id, !item.done);
    } catch {
      await load(); // Revert on error
    }
  };

  const handleDelete = async (item: TodoItem) => {
    try {
      setTodos((prev) => prev.filter((t) => t.id !== item.id));
      await deleteTodo(item.id);
    } catch {
      await load();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight flex-1">Shared To-Do</h1>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Add form */}
        <Card className="bg-card/60 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdd();
              }}
              className="flex gap-2"
            >
              <Input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add something…"
                className="flex-1 bg-background/50"
                disabled={adding}
              />
              <Button type="submit" size="icon" disabled={adding || !newTodo.trim()}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="bg-card/60 backdrop-blur border-border/50">
          <CardContent className="p-4 space-y-1">
            {loading && todos.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : todos.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                No tasks yet — add one above 💕
              </p>
            ) : (
              <AnimatePresence initial={false}>
                {todos.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-accent/30 transition-colors group"
                  >
                    <Checkbox
                      checked={item.done}
                      onCheckedChange={() => handleToggle(item)}
                      className="shrink-0"
                    />
                    <span
                      className={`flex-1 text-sm transition-all ${
                        item.done ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {item.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TodoList;
