# Lịch tập bổ trợ cầu lông 🏸

Web app hiển thị bài tập bổ trợ cầu lông theo từng ngày trong tuần, có checklist từng hiệp và bộ đếm thời gian nghỉ giữa các set.

**Stack:** Next.js 14 (App Router) · HeroUI v2 · Tailwind CSS · TypeScript

## Tính năng
- Chọn ngày trong tuần (T2 → CN) qua thanh lịch phía trên; ngày hôm nay được đánh dấu.
- Mỗi buổi tập hiện đầy đủ bài tập, khối lượng (số hiệp × số lần) và nhắc tư thế.
- Tick hoàn thành **từng hiệp**; tiến độ buổi tập và cả tuần được lưu tự động (localStorage).
- **Bộ đếm nghỉ** tự bật sau khi tick xong một hiệp (mặc định 60s, chọn nhanh 60s/90s), có báo tiếng + rung khi hết giờ.
- Ngày đánh cầu / ngày nghỉ hiện thẻ nhắc riêng. Chế độ sáng/tối.

## Chạy dự án
```bash
npm install
npm run dev
```
Mở http://localhost:3000

## PWA — cài lên điện thoại, chạy offline
App là Progressive Web App: cài được lên màn hình chính và dùng được khi mất mạng.

- **Cài đặt:** mở app trên trình duyệt (production) → menu trình duyệt → *Thêm vào màn hình chính* / *Cài đặt ứng dụng*.
- **Offline:** service worker (`public/sw.js`) cache app shell + asset của Next sau lần truy cập đầu; các buổi tập sau vẫn mở được khi không có mạng (dữ liệu vốn nằm ở `localStorage`).
- Service worker **chỉ đăng ký ở production** (tránh xung đột HMR khi `npm run dev`). Muốn thử: `npm run build && npm start`.
- Icon sinh bằng `npm run gen:icons` (script `scripts/gen-icons.mjs`, dùng `sharp`), xuất ra `public/`.

## Đồng bộ đám mây (Supabase) — tùy chọn
Không bắt buộc: nếu bỏ qua, app chạy hoàn toàn offline (chỉ `localStorage`).

1. Tạo project free tại [supabase.com](https://supabase.com).
2. Mở **SQL Editor** → dán toàn bộ `supabase/schema.sql` → **Run** (tạo bảng `user_state` + Row Level Security).
3. Vào **Project Settings → API**, copy **Project URL** và **anon public key**.
4. Tạo file `.env.local` từ mẫu và điền 2 giá trị đó:
   ```bash
   cp .env.local.example .env.local
   ```
5. **Authentication → URL Configuration**: thêm `http://localhost:3000` (và URL production) vào *Site URL* / *Redirect URLs*.
6. `npm run dev` lại. Nút ☁️ trên header cho phép đăng nhập bằng **email magic link** — sau khi đăng nhập, streak & lịch sử đồng bộ hai chiều, đa thiết bị. Dữ liệu offline sẽ được gộp lên cloud ở lần đăng nhập đầu.

Để build production:
```bash
npm run build
npm start
```

## Cấu trúc
- `app/page.tsx` — **trang chủ**: tổng quan streak, lịch sử, thẻ buổi tập hôm nay.
- `app/training/page.tsx` — **trang tập luyện**: chọn ngày, tick hiệp, bộ đếm nghỉ.
- `context/AppState.tsx` — state dùng chung cho cả hai trang (tiến độ, lịch sử, timer, cloud sync, bài tập tùy chỉnh).
- `components/ExerciseEditor.tsx` — modal thêm/sửa bài tập; `data/customize.ts` — lớp override bài tập theo ngày.
- `components/Header.tsx` — thanh header điều hướng (Trang chủ / Tập luyện) + streak + đồng bộ + theme.
- `data/workouts.ts` — toàn bộ nội dung lịch tập (sửa ở đây để đổi bài/khối lượng). Thêm ảnh minh hoạ bằng field `gif` cho từng bài — URL ngoài (`https://...gif`) hoặc file trong `public/gifs/` (vd `/gifs/wed-squat.gif`); nút "Xem cách tập" trong mỗi thẻ sẽ xổ ra hiển thị.
- `data/history.ts` — model lịch sử theo ngày + logic streak/thống kê/lịch.
- `components/WeekStrip.tsx` — thanh chọn ngày.
- `components/ExerciseCard.tsx` — thẻ bài tập + tick từng hiệp.
- `components/RestTimer.tsx` — bộ đếm thời gian nghỉ.
- `components/StreakPanel.tsx` — streak, thống kê tuần/tháng, lịch heatmap.
- `components/AuthButton.tsx` — đăng nhập magic link + trạng thái đồng bộ.
- `hooks/useCloudSync.ts` — đồng bộ hai chiều với Supabase.
- `lib/supabase.ts` — Supabase client (null khi chưa cấu hình).
- `supabase/schema.sql` — bảng + RLS để chạy trên Supabase.
