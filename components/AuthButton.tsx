"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { Cloud, CloudOff, LogOut, Mail, RefreshCw } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import type { SyncStatus } from "@/hooks/useCloudSync";

interface Props {
  enabled: boolean;
  session: Session | null;
  status: SyncStatus;
  onSignIn: (email: string) => Promise<{ error: string | null }>;
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
  onSignOut,
}: Props) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Supabase not configured → offline-only, don't clutter the header.
  if (!enabled) return null;

  if (session) {
    const email = session.user.email ?? "Đã đăng nhập";
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
            <p className="truncate text-sm font-semibold">{email}</p>
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

  async function handleSend() {
    setErr(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErr("Email không hợp lệ.");
      return;
    }
    setSending(true);
    const { error } = await onSignIn(email);
    setSending(false);
    if (error) setErr(error);
    else setSent(true);
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
        {sent ? (
          <div className="flex flex-col gap-1 py-1">
            <p className="text-sm font-semibold">Đã gửi link đăng nhập ✉️</p>
            <p className="text-xs text-default-500">
              Kiểm tra hộp thư <b>{email}</b> và bấm vào link để đồng bộ dữ
              liệu trên mọi thiết bị.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-default-500">
              Đăng nhập bằng email để lưu streak & lịch sử lên cloud, đồng bộ
              đa thiết bị.
            </p>
            <Input
              type="email"
              size="sm"
              placeholder="ban@email.com"
              value={email}
              onValueChange={setEmail}
              startContent={<Mail size={14} className="text-default-400" />}
              isInvalid={!!err}
              errorMessage={err}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button
              size="sm"
              color="primary"
              isLoading={sending}
              onPress={handleSend}
            >
              Gửi link đăng nhập
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
