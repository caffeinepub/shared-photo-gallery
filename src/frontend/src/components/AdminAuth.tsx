import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Lock, LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";

const ADMIN_PASSWORD = "purgeme123";

interface AdminAuthProps {
  isAdmin: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export function AdminAuth({ isAdmin, onLogin, onLogout }: AdminAuthProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
      setOpen(false);
      setPassword("");
      setError(false);
    } else {
      setError(true);
    }
  };

  if (isAdmin) {
    return (
      <Button
        data-ocid="admin.logout_button"
        variant="outline"
        size="sm"
        onClick={onLogout}
        className="gap-2 text-xs font-body"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
        Admin
        <LogOut className="w-3.5 h-3.5" />
      </Button>
    );
  }

  return (
    <>
      <Button
        data-ocid="admin.open_modal_button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 text-xs font-body text-muted-foreground hover:text-foreground"
      >
        <Lock className="w-3.5 h-3.5" />
        Admin
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="admin.dialog" className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Admin Login</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Input
                data-ocid="admin.input"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                autoFocus
              />
              {error && (
                <p
                  data-ocid="admin.error_state"
                  className="text-destructive text-xs mt-1.5"
                >
                  Incorrect password.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                data-ocid="admin.cancel_button"
                type="button"
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  setPassword("");
                  setError(false);
                }}
              >
                Cancel
              </Button>
              <Button data-ocid="admin.submit_button" type="submit">
                Login
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
