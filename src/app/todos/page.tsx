'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Plus, CheckSquare, ListTodo, Circle, CheckCircle2, MoreHorizontal, RotateCw } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function TodosPage() {
  const { status } = useSession();
  const [todos, setTodos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Collapse state
  const [todayOpen, setTodayOpen] = useState(true);
  const [laterOpen, setLaterOpen] = useState(true);
  const [completedOpen, setCompletedOpen] = useState(false);

  // New task inline state
  const [addingTo, setAddingTo] = useState<'today' | 'later' | null>(null);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTodos();
    }
  }, [status]);

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos');
      if (res.ok) {
        const data = await res.json();
        setTodos(data.todos);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleComplete = async (todo: any) => {
    // Optimistic update
    const isCompleted = !todo.completed;
    setTodos(prev => prev.map(t => 
      t._id === todo._id ? { ...t, completed: isCompleted } : t
    ));

    try {
      await fetch('/api/todos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: todo.sessionId, 
          todoId: todo._id, 
          updates: { completed: isCompleted } 
        }),
      });
    } catch (err) {
      console.error(err);
      // Revert if error (simple reload for now)
      fetchTodos();
    }
  };

  const handleAddNewTask = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTaskText.trim() && addingTo) {
      const text = newTaskText.trim();
      setNewTaskText('');
      setAddingTo(null);
      
      try {
        const res = await fetch('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            type: 'todo',
            timing: addingTo
          }),
        });
        if (res.ok) {
          const { todo } = await res.json();
          setTodos(prev => [todo, ...prev]);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="flex h-screen items-center justify-center bg-[#0f1115]"><div className="animate-spin text-indigo-500"><RotateCw className="w-6 h-6" /></div></div>;
  }

  // Categorize
  const todayTodos = todos.filter(t => !t.completed && t.timing === 'today');
  const laterTodos = todos.filter(t => !t.completed && t.timing !== 'today');
  const completedTodos = todos.filter(t => t.completed);

  const incompleteCount = todayTodos.length + laterTodos.length;

  return (
    <div className="flex flex-col flex-1 w-full bg-[#0f1115] text-slate-200 font-sans relative overflow-hidden">
      {/* Header */}
      <header className="px-5 py-4 border-b border-[#27272a] flex items-center justify-between flex-none bg-[#1c1c1f]">
        <div className="flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-indigo-400" />
          <h1 className="text-base font-semibold tracking-wide">To-do List</h1>
        </div>
      </header>

      {/* Main scrollable list */}
      <main className="flex-1 overflow-y-auto px-5 py-6 pb-32 custom-scrollbar">
        
        {/* SECTION: TODAY */}
        <div className="mb-8">
          <button 
            onClick={() => setTodayOpen(!todayOpen)} 
            className="flex items-center justify-between w-full text-left mb-4 group"
          >
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">Today</h2>
            <div className="text-[#71717a] group-hover:text-slate-300 transition-colors">
              {todayOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          {todayOpen && (
            <div className="space-y-0.5">
              {/* Add New Row */}
              <div 
                className="flex items-center gap-3 py-3 group cursor-text"
                onClick={() => setAddingTo('today')}
              >
                <div className="w-5 h-5 rounded flex items-center justify-center border border-[#3f3f46] text-[#71717a] bg-[#1c1c1f]">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                {addingTo === 'today' ? (
                  <input 
                    autoFocus
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={handleAddNewTask}
                    onBlur={() => { setAddingTo(null); setNewTaskText(''); }}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-slate-200 placeholder-[#71717a]"
                    placeholder="Type task and press enter..."
                  />
                ) : (
                  <span className="text-sm font-medium text-indigo-400">Add a new task to To-do list</span>
                )}
              </div>

              {todayTodos.map((todo) => (
                <div key={todo._id} className="flex items-center justify-between py-3 border-b border-[#27272a]/50 group">
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleComplete(todo)} className="mt-0.5 text-[#52525b] hover:text-indigo-400 transition-colors">
                      <div className="w-5 h-5 rounded border border-[#52525b] group-hover:border-indigo-400" />
                    </button>
                    <span className="text-sm text-slate-200">{todo.text}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION: LATER */}
        <div className="mb-8">
          <button 
            onClick={() => setLaterOpen(!laterOpen)} 
            className="flex items-center justify-between w-full text-left mb-4 group"
          >
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">Later</h2>
            <div className="text-[#71717a] group-hover:text-slate-300 transition-colors">
              {laterOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          {laterOpen && (
            <div className="space-y-0.5">
              <div 
                className="flex items-center gap-3 py-3 group cursor-text border-b border-[#27272a]/50"
                onClick={() => setAddingTo('later')}
              >
                <div className="w-5 h-5 rounded flex items-center justify-center border border-[#3f3f46] text-[#71717a] bg-[#1c1c1f]">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                {addingTo === 'later' ? (
                  <input 
                    autoFocus
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={handleAddNewTask}
                    onBlur={() => { setAddingTo(null); setNewTaskText(''); }}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-slate-200 placeholder-[#71717a]"
                    placeholder="Type task and press enter..."
                  />
                ) : (
                  <span className="text-sm font-medium text-[#71717a]">Add to Later</span>
                )}
              </div>

              {laterTodos.map((todo) => (
                <div key={todo._id} className="flex items-center justify-between py-3 border-b border-[#27272a]/50 group">
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleComplete(todo)} className="mt-0.5 text-[#52525b] hover:text-indigo-400 transition-colors">
                      <div className="w-5 h-5 rounded border border-[#52525b] group-hover:border-indigo-400" />
                    </button>
                    <span className="text-sm text-slate-200">{todo.text}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION: COMPLETED */}
        <div className="mb-8">
          <button 
            onClick={() => setCompletedOpen(!completedOpen)} 
            className="flex items-center justify-between w-full text-left mb-4 group"
          >
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">Completed</h2>
            <div className="text-[#71717a] group-hover:text-slate-300 transition-colors">
              {completedOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          {completedOpen && (
            <div className="space-y-0.5">
              {completedTodos.length === 0 && (
                <p className="text-sm text-[#52525b] py-2">No completed tasks yet.</p>
              )}
              {completedTodos.map((todo) => (
                <div key={todo._id} className="flex items-center justify-between py-3 border-b border-[#27272a]/50">
                  <div className="flex items-start gap-3 opacity-50">
                    <button onClick={() => toggleComplete(todo)} className="mt-0.5 text-indigo-400">
                      <CheckSquare className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-[#a1a1aa] line-through">{todo.text}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-6 left-0 right-0 px-5 flex items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto flex-1 max-w-[200px]">
          <button className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#1c1c1f] hover:bg-[#27272a] text-slate-200 border border-[#3f3f46] rounded-full text-sm font-semibold transition-colors shadow-lg">
            <ListTodo className="w-4 h-4 text-indigo-400" />
            Review {incompleteCount} Tasks
          </button>
        </div>
        <div className="pointer-events-auto flex-none">
          <button 
            onClick={() => setAddingTo('today')}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0369a1] hover:bg-[#0284c7] text-white rounded-full text-sm font-semibold transition-colors shadow-lg shadow-sky-900/20"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
      </div>
    </div>
  );
}
