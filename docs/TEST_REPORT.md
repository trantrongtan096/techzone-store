# Báo Cáo Kết Quả Kiểm Thử Hệ Thống (System Test Report)

Tài liệu này ghi nhận kết quả kiểm thử tự động và thủ công đối với hệ thống **TechZone Store** (Backend: Spring Boot + Database: MS SQL Server, Frontend: Angular 18).

---

## 🔑 1. Thông Tin Tài Khoản Thử Nghiệm (Seed Data)

Các tài khoản dưới đây được tự động khởi tạo thông qua `DataSeeder.java` khi ứng dụng khởi chạy:

| Email | Mật khẩu | Quyền (Role) | Chức năng kiểm thử |
| :--- | :--- | :--- | :--- |
| `user@techzone.vn` | `123456` | `ROLE_USER` | Mua hàng, thêm giỏ hàng, xem chi tiết sản phẩm. |
| `admin@techzone.vn` | `123456` | `ROLE_ADMIN` | Quản lý sản phẩm, đơn hàng, danh mục, thương hiệu. |
| `superadmin@techzone.vn` | `123456` | `ROLE_SUPER_ADMIN` | Đầy đủ quyền quản trị + Quản lý phân quyền tài khoản (Users). |

---

## 📊 2. Kết Quả Kiểm Thử Chi Tiết các Chức Năng

### 🛡️ A. Phân Quyền & Bảo Mật (Route Guards)
* **Trạng thái:** ✅ **Đạt**
* **Chi tiết:**
  * Route `/admin/**` yêu cầu người dùng đăng nhập và có role tối thiểu là `ROLE_ADMIN` (`adminGuard`).
  * Route `/admin/users` được bảo vệ thêm bằng `superAdminGuard`.
  * **Kiểm chứng:** Đăng nhập bằng tài khoản `admin@techzone.vn` và cố gắng truy cập `/admin/users` sẽ tự động bị điều hướng ngược về `/admin/dashboard`. Truy cập bằng `superadmin@techzone.vn` hiển thị danh sách người dùng bình thường.

### 🛒 B. Luồng Giỏ Hàng (Cart Operations)
* **Trạng thái:** ✅ **Đạt**
* **Chi tiết:**
  * Người dùng (chưa đăng nhập/đã đăng nhập) có thể thêm sản phẩm từ trang chủ hoặc danh sách sản phẩm vào Giỏ hàng.
  * Huy hiệu giỏ hàng (Cart badge) trên Header cập nhật số lượng chuẩn xác theo thời gian thực.
  * Tăng số lượng trong trang giỏ hàng cập nhật chính xác thành tiền của từng sản phẩm và tổng giá trị đơn hàng.
  * Xóa sản phẩm khỏi giỏ hàng hoạt động ổn định.

### 📦 C. Quản Lý Sản Phẩm (Admin Product Management)
* **Trạng thái:** ✅ **Đạt**
* **Chi tiết:**
  * Danh sách sản phẩm của Admin hiển thị dạng bảng rõ ràng kèm phân trang (Pagination).
  * Nút "Sửa" sản phẩm dẫn tới Form pre-fill đầy đủ thông số kỹ thuật (specs), hình ảnh, giá gốc và giá khuyến mãi của sản phẩm đó từ DB.

### 📁 D. Quản Lý Danh Mục & Thương Hiệu (Categories & Brands)
* **Trạng thái:** ✅ **Đạt**
* **Chi tiết:**
  * Tải đúng danh sách các Danh mục và Thương hiệu hiện có trong DB.
  * Nút "Thêm mới" mở ra hộp thoại (Modal) nhập thông tin trực quan. Trình duyệt đã kiểm thử nút hủy/đóng modal hoạt động chuẩn xác.

### 📋 E. Quản Lý Đơn Hàng (Order Management)
* **Trạng thái:** ✅ **Đạt**
* **Chi tiết:**
  * Trang quản lý đơn hàng của admin lọc tốt theo trạng thái đơn hàng (Tất cả, Chờ xử lý, Đang giao, Đã giao, Đã hủy).

---

## 🛠️ 3. Hướng Dẫn Chạy Kiểm Thử (Local Testing Setup)

1. **Khởi động Backend (cổng 8080):**
   ```powershell
   cd techzone-backend
   mvn spring-boot:run
   ```
2. **Khởi động Frontend (cổng 4200):**
   ```powershell
   cd techzone-frontend
   npm run start
   ```
3. **Truy cập ứng dụng:** `http://localhost:4200/`
