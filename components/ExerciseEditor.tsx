"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Switch,
  Textarea,
} from "@heroui/react";
import type { Exercise } from "@/data/workouts";

interface Props {
  open: boolean;
  /** The exercise being edited, or a blank one for "add". */
  initial: Exercise | null;
  mode: "add" | "edit";
  onClose: () => void;
  onSave: (ex: Exercise) => void;
}

export default function ExerciseEditor({
  open,
  initial,
  mode,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [volume, setVolume] = useState("");
  const [sets, setSets] = useState("3");
  const [cue, setCue] = useState("");
  const [gif, setGif] = useState("");
  const [star, setStar] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // re-seed the form whenever a different exercise opens
  useEffect(() => {
    if (!open || !initial) return;
    setName(initial.name);
    setVolume(initial.volume);
    setSets(String(initial.sets || 1));
    setCue(initial.cue);
    setGif(initial.gif ?? "");
    setStar(!!initial.star);
    setErr(null);
  }, [open, initial]);

  function handleSave() {
    const n = name.trim();
    const setsNum = parseInt(sets, 10);
    if (!n) return setErr("Nhập tên bài tập.");
    if (!Number.isFinite(setsNum) || setsNum < 1 || setsNum > 20)
      return setErr("Số hiệp phải từ 1 đến 20.");

    onSave({
      id: initial!.id,
      name: n,
      volume: volume.trim() || `${setsNum} hiệp`,
      sets: setsNum,
      cue: cue.trim(),
      star,
      ...(gif.trim() ? { gif: gif.trim() } : {}),
    });
  }

  return (
    <Modal isOpen={open} onOpenChange={(o) => !o && onClose()} placement="center">
      <ModalContent>
        <ModalHeader className="font-display">
          {mode === "add" ? "Thêm bài tập" : "Sửa bài tập"}
        </ModalHeader>
        <ModalBody className="gap-3">
          <Input
            label="Tên bài tập"
            value={name}
            onValueChange={setName}
            isRequired
            isInvalid={!!err && !name.trim()}
          />
          <div className="flex gap-3">
            <Input
              label="Khối lượng"
              placeholder="3 hiệp × 12–15"
              value={volume}
              onValueChange={setVolume}
              className="flex-1"
            />
            <Input
              type="number"
              label="Số hiệp"
              value={sets}
              onValueChange={setSets}
              min={1}
              max={20}
              className="w-28"
            />
          </div>
          <Textarea
            label="Nhắc tư thế"
            value={cue}
            onValueChange={setCue}
            minRows={2}
          />
          <Input
            label="Link GIF minh hoạ (tuỳ chọn)"
            placeholder="https://… hoặc /gifs/ten.gif"
            value={gif}
            onValueChange={setGif}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-default-600">
              Đánh dấu ⭐ (bài phòng chấn thương quan trọng)
            </span>
            <Switch isSelected={star} onValueChange={setStar} size="sm" />
          </div>
          {err && <p className="text-xs text-danger">{err}</p>}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Huỷ
          </Button>
          <Button color="primary" onPress={handleSave}>
            Lưu
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
