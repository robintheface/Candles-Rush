# Xcode Security & Game Runtime Audit — Plan

**Project:** App · 1 target · Swift + JavaScript/Capacitor  
**Generated:** 2026-09-27

Dự án có Git. Chưa có thay đổi build setting hoặc entitlement nào được áp dụng trong giai đoạn audit.

## Phạm vi thực thi

- [x] **Harden cầu nối JavaScript → native audio**
  - Chỉ nhận message từ main frame của WebView.
  - Chỉ cho phép action và tên file audio nằm trong whitelist.
  - Từ chối số không hữu hạn; clamp volume và thời gian fade.
  - Giới hạn số effect player đồng thời để tránh tăng RAM/CPU nếu message bị spam.

- [x] **Tối ưu vòng lặp game**
  - Chuyển cập nhật vật lý sang fixed timestep 60 Hz, giới hạn số bước bù sau khi app bị khựng.
  - Chỉ render một lần mỗi display frame.
  - Cache sprite nến xanh đã tint màu lá chuối; bỏ canvas filter lặp lại ở mỗi frame.
  - Giữ nguyên tốc độ, hitbox, tỉ lệ spawn và gameplay hiện tại.

- [x] **Enhanced Security cho target App**
  - Bật `ENABLE_ENHANCED_SECURITY=YES`.
  - Bật pointer authentication thông qua Enhanced Security.
  - Tạo/cập nhật entitlements: hardened process v2, hardened heap, read-only dyld state, platform restrictions.
  - Build và xử lý warning phát sinh.

- [ ] **Hardware Memory Tagging và Checked Pointer Arithmetic**
  - Tạm hoãn mặc định vì app liên kết nhiều native binary/package; cần rollout soft-mode và kiểm thử trên phần cứng phù hợp trước khi bật enforcement.

- [x] **Kiểm tra cấu hình phát hành**
  - Xác minh `CAPACITOR_DEBUG` không được bật trong Release.
  - Kiểm tra ATS/WebView configuration và các URL mở ra ngoài app.
  - Chạy build đầy đủ, kiểm tra warning và `git diff --check`.

## Rủi ro cần backend — không thể sửa an toàn chỉ trong client

Leaderboard hiện gửi điểm trực tiếp từ JavaScript tới Firestore. Firebase Authentication chỉ xác định tài khoản, không chứng minh điểm được tạo bởi một lượt chơi hợp lệ. Biện pháp đúng là chặn client write bằng Firestore Rules, dùng backend callable/HTTPS có App Check, run token một lần, validation server-side và rate limit. Không thêm validation JavaScript giả tạo vì có thể bị bypass.

## Quyết định dự kiến

- Giữ kích thước/tần suất coin và nến hiện tại.
- Không thay đổi background, asset hoặc thiết kế gameplay.
- Không ghi secret/token vào log.
- Nếu Enhanced Security làm dependency không tương thích, giữ code fixes và ghi rõ setting phải defer cùng lý do.
