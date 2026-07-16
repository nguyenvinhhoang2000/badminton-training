"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { Cloud, CloudOff, LogOut, Lock, Mail, RefreshCw } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import type { SyncStatus } from "@/hooks/useCloudSync";

interface Props {
  enabled: boolean;
  session: Session | null;
  status: SyncStatus;
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  onSignUp: (
    email: string,
    password: string
  ) => Promise<{ error: string | null; needsConfirm: boolean }>;
  onSignOut: () => void;
}

const statusLabel: Record<SyncStatus, string> = {
  idle: "",
  syncing: "Đang đồng bộ…",
  synced: "Đã đồng bộ",
  error: "Lỗi đồng bộ",
};

export default function AuthButton({
  enabled,
  session,
  status,
  onSignIn,
  onSignUp,
  onSignOut,
}: Props) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Supabase not configured → offline-only, don't clutter the header.
  if (!enabled) return null;

  if (session) {
    const userEmail = session.user.email ?? "Đã đăng nhập";
    return (
      <Popover placement="bottom-end">
        <PopoverTrigger>
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            aria-label="Tài khoản & đồng bộ"
            color={status === "error" ? "danger" : "primary"}
          >
            {status === "syncing" ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Cloud size={16} />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-default-500">Đang đăng nhập</p>
            <p className="truncate text-sm font-semibold">{userEmail}</p>
            {status !== "idle" && (
              <p
                className={`text-xs ${
                  status === "error" ? "text-danger" : "text-default-400"
                }`}
              >
                {statusLabel[status]}
              </p>
            )}
            <Button
              size="sm"
              variant="flat"
              color="danger"
              startContent={<LogOut size={14} />}
              onPress={onSignOut}
            >
              Đăng xuất
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  async function submit() {
    setErr(null);
    setNotice(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return setErr("Email không hợp lệ.");
    if (password.length < 6) return setErr("Mật khẩu tối thiểu 6 ký tự.");

    setBusy(true);
    if (mode === "in") {
      const { error } = await onSignIn(email, password);
      setBusy(false);
      if (error) setErr(error);
    } else {
      const { error, needsConfirm } = await onSignUp(email, password);
      setBusy(false);
      if (error) setErr(error);
      else if (needsConfirm)
        setNotice("Đã tạo tài khoản. Kiểm tra email để xác nhận rồi đăng nhập.");
      // else: session set automatically → view switches to logged-in
    }
  }

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button
          isIconOnly
          variant="flat"
          size="sm"
          aria-label="Đăng nhập để đồng bộ"
        >
          <CloudOff size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3">
        <div className="flex flex-col gap-2">
          <p className="text-xs text-default-500">
            {mode === "in"
              ? "Đăng nhập để đồng bộ streak, lịch sử & bài tập trên mọi thiết bị."
              : "Tạo tài khoản mới bằng email + mật khẩu."}
          </p>
          <Input
            type="email"
            size="sm"
            placeholder="ban@email.com"
            value={email}
            onValueChange={setEmail}
            startContent={<Mail size={14} className="text-default-400" />}
            autoComplete="email"
          />
          <Input
            type="password"
            size="sm"
            placeholder="Mật khẩu (≥ 6 ký tự)"
            value={password}
            onValueChange={setPassword}
            startContent={<Lock size={14} className="text-default-400" />}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            isInvalid={!!err}
            errorMessage={err}
          />
          {notice && <p className="text-xs text-primary">{notice}</p>}
          <Button size="sm" color="primary" isLoading={busy} onPress={submit}>
            {mode === "in" ? "Đăng nhập" : "Đăng ký"}
          </Button>
          <button
            type="button"
            className="text-center text-xs text-default-500 hover:text-default-700"
            onClick={() => {
              setMode((m) => (m === "in" ? "up" : "in"));
              setErr(null);
              setNotice(null);
            }}
          >
            {mode === "in"
              ? "Chưa có tài khoản? Đăng ký"
              : "Đã có tài khoản? Đăng nhập"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
