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
  - Trưởng phòng CSVC
  - Nhân viên CSVC
  - Nhân viên phòng ban
- Tổng quan vòng đời thiết bị.
- Quản lý khu vực theo cấu trúc tòa, tầng, phòng.
- Thiết bị:
  - Quản lý loại thiết bị: xem, thêm, sửa, xóa mã và tên loại; tổng số lượng và tồn kho tự cập nhật từ tồn kho cùng thiết bị ngoài kho.
  - Quản lý thiết bị: xem, thêm, sửa, xóa mã, tên, loại, phòng ban quản lý, vị trí và tình trạng; tìm kiếm và lọc tình trạng.
- Quản lý phòng ban với nhiều người phụ trách được chọn từ danh sách người dùng.
- Quản lý người dùng: thêm, sửa, khóa/mở khóa; ba vai trò và dữ liệu mẫu.
- Kho gồm bốn nghiệp vụ Nhập, Cấp phát, Thu hồi, Thanh lý:
  - Mỗi nghiệp vụ có danh sách phiếu riêng, tìm kiếm và lọc trạng thái.
  - Phiếu nhóm theo loại thiết bị và số lượng; mở từng loại để xem tên, mã và mã vạch của các thiết bị bên trong.
  - Bấm mã phiếu hoặc Xem để mở thông tin chung, danh sách thiết bị, thông tin duyệt/kết quả và lịch sử xử lý.
  - Có hai phiếu mẫu cho mỗi nghiệp vụ. Phiếu vừa tạo mở ngay chi tiết trong trang Kho.
  - Cấp phát, Thu hồi, Thanh lý: chọn loại và tích chọn thiết bị có sẵn ở trạng thái Trong kho; hỗ trợ tìm theo tên/mã/mã vạch, tự đếm số lượng và lưu chi tiết từng thiết bị.
  - Lập phiếu nhập
  - Nhập thông tin nhà cung cấp, vận chuyển, phiếu yêu cầu, ngày giao, đợt giao, phòng ban yêu cầu
  - Chọn loại trước, thêm/xóa từng thiết bị có tên, mã, mã vạch; số lượng loại và tổng phiếu tự cập nhật theo danh sách thiết bị.
  - Khi xác nhận nhập, lưu từng thiết bị vào danh sách thiết bị và cập nhật tồn kho theo số lượng thực tế.
  - Tự sinh ID cho thiết bị nếu người dùng để trống
  - Sinh và in tem mã vạch trước khi xác nhận nhập kho
  - Theo dõi stock quantity và stock transaction theo loại thiết bị
- Sử dụng thiết bị:
  - Mượn / trả, Điều chuyển, Báo hỏng có danh sách phiếu riêng, tìm kiếm, lọc trạng thái và xem chi tiết.
  - Phiếu nhóm theo loại và số lượng; mở từng loại để xem thiết bị, mã vạch, trạng thái xử lý và lịch sử.
  - Tạo phiếu bằng cách chọn loại rồi chọn các thiết bị có sẵn; số lượng tự cập nhật, lưu xong mở ngay chi tiết tại trang Sử dụng.
  - Mỗi nghiệp vụ có hai phiếu mẫu; chi tiết mượn/trả thể hiện trạng thái đang mượn hoặc đã trả theo từng thiết bị.
- Bảo trì:
  - Bảo trì, Sửa chữa, Bảo hành có danh sách phiếu riêng, tìm kiếm, lọc trạng thái và xem chi tiết.
  - Chọn loại rồi chọn các thiết bị có sẵn; số lượng tự cập nhật, lưu xong mở ngay chi tiết tại trang Bảo trì.
  - Bảo trì có hình thức định kỳ/đột xuất, thời gian dự kiến và nội dung công việc.
  - Sửa chữa lưu yêu cầu và báo hỏng liên quan theo từng thiết bị; hiển thị kết quả Đang sửa, Sửa xong hoặc Không thể sửa cùng mô tả, người ghi nhận, thời gian hoàn thành.
  - Bảo hành giữ thông tin đơn vị tiếp nhận bên ngoài, mã bảo hành và kết quả từng thiết bị. Mỗi nghiệp vụ có hai phiếu mẫu với lịch sử xử lý.
- Duyệt phiếu theo vai trò.
- Tra cứu lịch sử thiết bị.
- Xem các sơ đồ workflow/usecase đã copy vào `public/docs`.

## Phân quyền prototype

Role `Nhân viên phòng ban` không thấy các trang quản trị như:

- Thiết bị
- Phòng ban
- Kho
- Bảo trì
- Duyệt phiếu

Trang Người dùng chỉ hiển thị cho vai trò Trưởng phòng CSVC.

## Ghi chú repo

- `node_modules/`, `dist/` và `Documents/` được đưa vào `.gitignore`.
- Các ảnh cần hiển thị trong app nằm ở `public/docs`.
- Thư mục `Documents/` là tài liệu tham khảo local, không commit lên repo.
