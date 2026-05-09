"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsForm({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState(updateProfile, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success("Profile updated");
    else toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="glass-panel max-w-lg space-y-4 rounded-2xl border border-border/70 p-6">
      <div className="space-y-2">
        <Label htmlFor="full_name">Display name</Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={defaultName}
          placeholder="Alex Rivera"
          disabled={pending}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
