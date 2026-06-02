import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/book")({
  head: () => ({
    meta: [
      { title: "Book a meeting — Prosa" },
      { name: "description", content: "Schedule a 30-minute call with the Prosa team." },
    ],
  }),
  component: BookPage,
});

type Appt = {
  id: string;
  topic: string;
  scheduled_for: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
};

const TOPICS = ["Product demo", "Onboarding help", "Education / classroom", "Enterprise / team", "Partnership", "Other"];
const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

function todayISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function BookPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Appt[]>([]);
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState("10:00");
  const [duration, setDuration] = useState("30");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email ?? "");
    (async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_for", { ascending: true });
      setList((data ?? []) as Appt[]);
    })();
  }, [user]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const scheduledFor = new Date(`${date}T${slot}:00`);
    if (scheduledFor <= new Date()) {
      toast.error("Pick a time in the future.");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        user_id: user.id,
        name: name.trim() || (user.email ?? "Guest"),
        email: email.trim() || (user.email ?? ""),
        topic,
        scheduled_for: scheduledFor.toISOString(),
        duration_minutes: Number(duration),
        notes: notes.trim() || null,
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setList((prev) => [...prev, data as Appt].sort((a, b) => a.scheduled_for.localeCompare(b.scheduled_for)));
    setNotes("");
    toast.success("Booked! We've added it to your calendar.");
  };

  const cancel = async (id: string) => {
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setList((prev) => prev.filter((a) => a.id !== id));
    toast.success("Cancelled.");
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <header className="mb-8">
        <h1 className="font-serif text-4xl tracking-tight text-foreground">Book a meeting</h1>
        <p className="mt-2 text-muted-foreground">
          Pick a slot — a Prosa team member will confirm by email. Need pricing first?{" "}
          <Link to="/pricing" className="text-primary hover:underline">See plans</Link>.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={submit} className="space-y-5 rounded-xl border border-border/60 bg-card/40 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Topic</Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Select value={slot} onValueChange={setSlot}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SLOTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} />
          </div>

          <Button type="submit" disabled={saving}>{saving ? "Booking…" : "Book meeting"}</Button>
        </form>

        <section>
          <h2 className="mb-3 font-medium text-foreground">Upcoming</h2>
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming meetings.</p>
          ) : (
            <ul className="space-y-3">
              {list.map((a) => {
                const dt = new Date(a.scheduled_for);
                return (
                  <li key={a.id} className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/40 p-4">
                    <Calendar className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{a.topic}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        {dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        <span>·</span>
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        <span>·</span>
                        {a.duration_minutes} min
                      </p>
                      {a.notes && <p className="mt-2 text-xs text-muted-foreground">{a.notes}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => cancel(a.id)}
                      aria-label="Cancel meeting"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
