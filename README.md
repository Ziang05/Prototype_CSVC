# Prototype Quản Lý Cơ Sở Vật Chất

Prototype UI React cho hệ thống quản lý cơ sở vật chất, tập trung mô phỏng các nghiệp vụ chính bằng dữ liệu mock.

## Công nghệ

- React
- Vite
- Lucide React icons
- Mock API nội bộ trong `src/mockApi.js`

## Chạy project

```bash
npm install
npm run dev
```

Mặc định Vite sẽ chạy tại:

```text
http://localhost:5173/
```

Build production:

```bash
npm run build
```

## Chức năng chính

- Chọn vai trò người dùng:
  - Trưởng phòng quản lý thiết bị
  - Nhân viên phòng quản lý thiết bị
  - Nhân viên phòng ban
- Tổng quan vòng đời thiết bị.
- Quản lý khu vực theo cấu trúc tòa, tầng, phòng.
- Quản lý danh mục:
  - Danh mục thiết bị
  - Danh mục phòng ban
- Nhập kho:
  - Lập phiếu nhập
  - Nhập thông tin nhà cung cấp, vận chuyển, phiếu yêu cầu, ngày giao, đợt giao, phòng ban yêu cầu
  - Nhập thiết bị theo loại và số lượng
  - Tự sinh ID cho thiết bị nếu người dùng để trống
  - Sinh và in tem mã vạch trước khi xác nhận nhập kho
  - Theo dõi stock quantity và stock transaction theo loại thiết bị
- Sử dụng thiết bị:
  - Mượn / trả
  - Điều chuyển
  - Báo hỏng
- Bảo trì:
  - Bảo trì
  - Sửa chữa
  - Bảo hành
- Duyệt phiếu theo vai trò.
- Tra cứu lịch sử thiết bị.
- Xem các sơ đồ workflow/usecase đã copy vào `public/docs`.

## Phân quyền prototype

Role `Nhân viên phòng ban` không thấy các trang quản trị như:

- Danh mục
- Nhập kho
- Bảo trì
- Duyệt phiếu

## Ghi chú repo

- `node_modules/`, `dist/` và `Documents/` được đưa vào `.gitignore`.
- Các ảnh cần hiển thị trong app nằm ở `public/docs`.
- Thư mục `Documents/` là tài liệu tham khảo local, không commit lên repo.
