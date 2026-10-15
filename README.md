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
  - Lập phiếu cấp phát theo cấu trúc thông tin chung và nhiều thiết bị
  - Chọn phòng ban, vị trí nhận, người tiếp nhận và ngày cấp phát dự kiến
  - Chỉ chọn thiết bị đang trong kho; mỗi thiết bị là một dòng duyệt độc lập
  - Lập phiếu thu hồi theo từng phòng ban, chỉ chọn thiết bị phòng ban đó đang quản lý
  - Lập phiếu thanh lý với căn cứ, lý do, phương thức đề xuất và thiết bị xuống cấp tại kho
- Sử dụng thiết bị:
  - Lập phiếu mượn với người chịu trách nhiệm, thời gian mượn/trả dự kiến và nhiều thiết bị
  - Lập phiếu điều chuyển theo một cặp phòng ban nguồn/nhận và vị trí nhận dự kiến
  - Báo hỏng một thiết bị với mức độ, ảnh hưởng vận hành và mô tả hiện tượng
  - Chỉ ghi nhận trả, bàn giao hoặc kết quả xử lý ở bước sau khi phiếu được duyệt
- Bảo trì:
  - Lập phiếu bảo trì định kỳ/đột xuất với kế hoạch, phạm vi và nhiều thiết bị
  - Lập phiếu sửa chữa với nội dung yêu cầu riêng cho từng thiết bị và liên kết báo hỏng
  - Kiểm tra phiếu nhập, nhà cung cấp và hạn bảo hành trước khi tạo yêu cầu bảo hành
  - Chỉ ghi nhận kết quả bảo trì, sửa chữa hoặc bảo hành ở bước xử lý sau duyệt
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
