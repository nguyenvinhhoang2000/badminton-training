export type DayType = "rest-active" | "rest" | "badminton" | "training";

export interface Exercise {
  id: string;
  name: string;
  volume: string; // e.g. "3 hiệp × 12–15"
  sets: number; // number of checkable sets
  cue: string; // form reminder
  star?: boolean; // key injury-prevention move
  // Ảnh/GIF minh hoạ cách tập. Có thể là URL ngoài
  // (vd https://...gif) hoặc file trong public/ (vd /gifs/wed-squat.gif).
  gif?: string;
}

export interface Day {
  key: string;
  short: string; // T2, T3...
  label: string; // Thứ 2
  type: DayType;
  title: string;
  subtitle?: string;
  accent: "teal" | "blue" | "violet" | "slate";
  warmup?: string;
  note?: string;
  exercises?: Exercise[];
}

export const REST_PRESETS = [60, 90]; // seconds, matches "nghỉ 60–90 giây"

export const days: Day[] = [
  {
    key: "mon",
    short: "T2",
    label: "Thứ 2",
    type: "rest-active",
    title: "Nghỉ chủ động",
    subtitle: "Hồi phục sau cuối tuần",
    accent: "slate",
    note: "Đi bộ nhanh hoặc đạp xe nhẹ ngoài công viên, giãn cơ. Cơ thể còn mỏi sau T7 + CN, và mai lại đánh cầu — tuyệt đối không tập chân nặng hôm nay.",
  },
  {
    key: "tue",
    short: "T3",
    label: "Thứ 3",
    type: "badminton",
    title: "Đánh cầu",
    subtitle: "Buổi chơi giữa tuần",
    accent: "teal",
    note: "Ra sân đánh cầu. Khởi động kỹ cổ chân, gối và vai trước khi vào trận để tránh chấn thương.",
  },
  {
    key: "wed",
    short: "T4",
    label: "Thứ 4",
    type: "training",
    title: "Chân + Core",
    subtitle: "Buổi bổ trợ chính",
    accent: "blue",
    warmup:
      "Khởi động 5–7 phút: xoay cổ chân / gối / hông + đi bộ nhanh hoặc nhảy dây nhẹ 2 phút.",
    note: "Nghỉ 60–90 giây giữa các hiệp. Buổi này nặng nhất, đặt xa cuối tuần để chân có 2 ngày hồi phục.",
    exercises: [
      {
        id: "wed-squat",
        name: "Squat tay không",
        volume: "3 hiệp × 12–15",
        sets: 3,
        cue: "Lưng thẳng, gối cùng hướng mũi chân, không quặp vào trong.",
        gif: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Squats_wbs.gif",
      },
      {
        id: "wed-lunge",
        name: "Bước tấn lùi (reverse lunge)",
        volume: "3 × 10 mỗi chân",
        sets: 3,
        cue: "Bước lùi, hạ gối sau gần đất, dồn lực vào gót chân trước.",
        gif: "https://upload.wikimedia.org/wikipedia/commons/a/af/Lunge-CDC_strength_training_for_older_adults.gif",
      },
      {
        id: "wed-calf",
        name: "Nhón bắp chuối",
        volume: "3 hiệp × 15–20",
        sets: 3,
        cue: "Đứng nửa bàn chân trên bậc thang để hạ gót sâu hơn.",
        gif: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Rocking-standing-calf-raise-1.gif",
      },
      {
        id: "wed-balance",
        name: "Đứng thăng bằng một chân",
        volume: "3 × 30 giây/chân",
        sets: 3,
        star: true,
        cue: "Phòng lật cổ chân. Khá hơn thì nhắm mắt hoặc đứng trên mặt mềm.",
        gif: "https://media.tenor.com/9VloFRHQkKAAAAAM/balance-1leg.gif",
      },
      {
        id: "wed-rope",
        name: "Nhảy dây",
        volume: "3 hiệp × 1 phút",
        sets: 3,
        cue: "Tiếp đất nửa bàn chân trước, gối hơi chùng, nhảy vừa sức.",
        gif: "https://media.tenor.com/FzbqxYZC98IAAAAM/jump-rope-exercise.gif",
      },
      {
        id: "wed-plank",
        name: "Plank",
        volume: "3 × 30–45 giây",
        sets: 3,
        cue: "Thân thẳng như tấm ván, siết bụng & mông, không võng lưng.",
        gif: "https://media.tenor.com/73Sld1d9MbkAAAAM/plank-workout.gif",
      },
    ],
  },
  {
    key: "thu",
    short: "T5",
    label: "Thứ 5",
    type: "training",
    title: "Core + Phòng chấn thương",
    subtitle: "Buổi bổ trợ nhẹ",
    accent: "violet",
    note: "KHÔNG tải chân — giữ chân tươi cho cuối tuần. Trọng tâm là vai, cổ tay và core.",
    exercises: [
      {
        id: "thu-rotation",
        name: "Xoay vai ra ngoài với dây kháng lực",
        volume: "3 × 12–15 mỗi tay",
        sets: 3,
        star: true,
        cue: "Quan trọng nhất buổi này. Khuỷu tay ép sát hông, xoay cẳng tay ra chậm rãi.",
      },
      {
        id: "thu-pullapart",
        name: "Kéo dây tách vai (band pull-apart)",
        volume: "3 hiệp × 15",
        sets: 3,
        cue: "Duỗi thẳng dây trước ngực, kéo căng sang hai bên, siết bả vai.",
        gif: "https://media.tenor.com/IrYw1RzccdoAAAAM/resistance-bands-workout.gif",
      },
      {
        id: "thu-wrist",
        name: "Cuộn cổ tay với chai nước",
        volume: "3 hiệp × 15",
        sets: 3,
        cue: "Cẳng tay tì lên đùi, chỉ cử động cổ tay cuộn cả lên và xuống.",
        gif: "https://media.tenor.com/J3eICLvit4kAAAAM/wrist-curl-bar.gif",
      },
      {
        id: "thu-twist",
        name: "Russian twist (xoay hông)",
        volume: "3 × 20 (10/bên)",
        sets: 3,
        cue: "Ngả lưng nhẹ, nhấc chân, xoay thân — mô phỏng lực vụt cầu.",
        gif: "https://media.tenor.com/OLwm7qK98FgAAAAM/russiantwist-core.gif",
      },
      {
        id: "thu-sideplank",
        name: "Side plank (plank nghiêng)",
        volume: "3 × 20–30 giây/bên",
        sets: 3,
        cue: "Khó quá thì chống gối xuống để giảm độ nặng.",
        gif: "https://media.tenor.com/1K4pElADw6sAAAAM/fitness-sideplank.gif",
      },
      {
        id: "thu-birddog",
        name: "Bird dog",
        volume: "3 × 10 mỗi bên",
        sets: 3,
        cue: "Tư thế bò, duỗi tay này + chân đối diện, giữ 2 giây rồi đổi bên.",
        gif: "https://media.tenor.com/6nO5406JCHIAAAAM/bird-dog.gif",
      },
    ],
  },
  {
    key: "fri",
    short: "T6",
    label: "Thứ 6",
    type: "rest",
    title: "Nghỉ hẳn",
    subtitle: "Giữ chân tươi cho cuối tuần",
    accent: "slate",
    note: "Nghỉ hoàn toàn để chân tươi bước vào cuối tuần. Đây là quy tắc quan trọng nhất — không tập chân nặng sát ngày cầu.",
  },
  {
    key: "sat",
    short: "T7",
    label: "Thứ 7",
    type: "badminton",
    title: "Học cầu",
    subtitle: "Buổi học chính",
    accent: "teal",
    note: "Lên lớp học cầu lông. Khởi động kỹ trước buổi và giãn cơ nhẹ sau khi kết thúc.",
  },
  {
    key: "sun",
    short: "CN",
    label: "Chủ nhật",
    type: "badminton",
    title: "Học cầu",
    subtitle: "Buổi học chính",
    accent: "teal",
    note: "Buổi học thứ hai trong tuần. Sau CN nên nghỉ chủ động vào T2 để hồi phục.",
  },
];

export const reminders: string[] = [
  "2 tuần đầu tập nhẹ (ít hiệp, không cố sức) để làm quen tư thế; từ tuần 3 mới tăng dần độ khó.",
  "Không tập chân nặng sát ngày cầu, và Thứ 6 luôn nghỉ hẳn để chân tươi vào cuối tuần.",
  "Đau nhói ở khớp (khác với mỏi cơ) thì dừng ngay. Luôn giãn cơ nhẹ sau mỗi buổi.",
  "Nếu tuần nào không đánh cầu T3: dời buổi Chân về đầu tuần, vẫn giữ T6 nghỉ.",
];
