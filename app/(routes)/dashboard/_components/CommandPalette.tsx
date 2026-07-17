"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { FolderKanban, ListChecks, Users, UserCog, Receipt } from "lucide-react";
import { useDashboardSearch } from "./SearchContext";

export function CommandPalette() {
  const { open, closeSearch, toggleSearch } = useDashboardSearch();
  const router = useRouter();

  const projects = useQuery(api.projects.list) ?? [];
  const tasks = useQuery(api.tasks.list) ?? [];
  const customers = useQuery(api.customers.list) ?? [];
  const staffs = useQuery(api.staffs.list) ?? [];
  const invoices = useQuery(api.billing.list) ?? [];

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleSearch();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toggleSearch]);

  function go(path: string) {
    closeSearch();
    router.push(path);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeSearch();
      }}
      title="Quick search"
      description="Jump to anything across Mesa Systems"
    >
      <CommandInput placeholder="Search projects, tasks, people, invoices..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Projects">
          {projects.slice(0, 6).map((p) => (
            <CommandItem key={p.id} value={`${p.name} ${p.client}`} onSelect={() => go("/projects")}>
              <FolderKanban className="text-muted-foreground" />
              <span>{p.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{p.client}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Tasks">
          {tasks.slice(0, 6).map((t) => (
            <CommandItem key={t.id} value={`${t.title} ${t.assignee}`} onSelect={() => go("/tasks")}>
              <ListChecks className="text-muted-foreground" />
              <span>{t.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">{t.assignee}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Customers">
          {customers.slice(0, 6).map((c) => (
            <CommandItem key={c.id} value={`${c.name} ${c.company}`} onSelect={() => go("/customer")}>
              <Users className="text-muted-foreground" />
              <span>{c.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{c.company}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Staff">
          {staffs.slice(0, 6).map((s) => (
            <CommandItem key={s.id} value={`${s.name} ${s.status}`} onSelect={() => go("/staffs")}>
              <UserCog className="text-muted-foreground" />
              <span>{s.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{s.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Invoices">
          {invoices.slice(0, 6).map((i) => (
            <CommandItem key={i.id} value={`${i.id} ${i.customer}`} onSelect={() => go("/billing")}>
              <Receipt className="text-muted-foreground" />
              <span>{i.customer}</span>
              <span className="ml-auto text-xs text-muted-foreground">{i.amount}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}