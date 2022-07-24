# Theway-shop

Các yêu cầu đề ra như sau:

*Thiết kế CSDL
*Nội dung trong CSDL phong phú
*Kiến trúc của website
Báo cáo
Phim hướng dẫn
*Quá trình thực hiện website được đăng lên Git
*Sử dụng một thư viện chuyên về authentication
*Website đã được đăng và hoạt động tốt trên host thực tế

-- multi image, order , clear cache
 
-- số lần xem sản phẩm,
tùy chỉnh hiển thị,
Thống kê doanh số bán hàng theo
các ngày, tuần, tháng, năm, quý

*Xem danh sách các sản phẩm theo từng loại sản phẩm
*Phân trang danh sách sản phẩm
*Xem thông tin chi tiết sản phẩm
*Hiển thị các sản phẩm liên quan
*Kích hoạt tài khoản bằng email
*Cập nhật thông tin cá nhân của tài khoản
Kiểm tra các ràng buộc
Quản lý hệ thống gian hàng
Quản lý sản phẩm trên gian hàng
*Phân trang, lọc danh sách sản phẩm
*Cho phép đăng tải các hình đại diện của sản phẩm
*AJAX
*Sử dụng memory cache để tăng tốc độ website
*Hiển thị danh sách bình luận sản phẩm
*Thêm bình luận
*Phân trang bình luận
chat
Sử dụng Google Analytics
Vẽ biểu đồ
paypal sandbox

cần bây giờ : tìm kiếm nâng cao(filter), giỏ hàng khi chưa đăng nhập, giỏ hàng khi đã đăng nhập, đặt hàng, xem danh sách đơn hàng 
*Tìm kiếm - trang chủ
Tìm kiếm nâng cao - trang chủ
Phân trang tìm kiếm - trang chủ
Xem danh sách các sản phẩm theo từng nhà sản xuất/phân loại
Chọn sản phẩm vào giỏ hàng
Quản lý giỏ hàng
*Đăng ký tài khoản - trang chủ
*Kiểm tra các ràng buộc về tên đăng nhập, mật khẩu nhập lại, ...- trang chủ
*Đăng nhập hệ thống- trang chủ
*Ngăn cấm người chưa đăng nhập sử dụng các chức năng bắt buộc đăng nhập theo quyền hạn- trang chủ
*Quên mật khẩu và làm mới mật khẩu bằng email- trang chủ
*Yêu cầu nhập lại mật khẩu cũ khi thay đổi mật khẩu
Đặt hàng siêu thị và thanh toán
Điền các thông tin về giao hàng
Xem thông tin lịch sử quá trình và trạng thái mua hàng

*Kiểm tra các ràng buộc về tên đăng nhập, mật khẩu nhập lại, ... - trang admin
*Đăng nhập hệ thống - trang admin
*Ngăn cấm người chưa đăng nhập sử dụng các chức năng bắt buộc đăng nhập theo quyền hạn - trang admin
*Xem các tài khoản admin
Thay đổi thông tin cá nhân của chính mình
Xem danh sách các tài khoản của người dùng
Phân trang danh sách người dùng
Xem thông tin chi tiết của người dùng
Khóa, mở khóa tài khoản người dùng
Kiểm tra các ràng buộc về sản phẩm
Quản lý đơn đặt hàng (đã giao, chưa giao, đang giao)
Thống kê doanh số bán hàng theo các ngày, tuần, tháng, năm, quý
Thống kê số lượng bán top 10 của sản phẩm, của gian hàng



* Guildine: 
Tải và cài đặt postgres server. Hướng dẫn các bước từ trang www.postgresql.org
Mở powershell, gõ “psql -U postgres” . Tại đây sẽ hỏi mật khẩu khi cài đặt chúng ta đã đặt
Sau khi đã kết nối được tới server ta sẽ gõ lệnh sau để tạo database : “CREATE DATABASE thewayshop WITH ENCODING ‘UTF8’ ;”
Sau đó dùng lệnh “\c thewayshop ” để kết nối với database
Dùng lệnh “ \i ‘path/postgres.sql’ ” với path là đường dẫn tới file postgres.sql nằm trong thư mục database
Lấy các thông tin cần thiết để thay vào chuỗi sau:"postgres://YourUserName:YourPassword@YourHostname:5432/YourDatabaseName"
Thay chuỗi trên với chuỗi phía sau biến “DATABASE_URL_LOCAL” trong file .env của mỗi project

App:
Tải và cài đặt nodejs, npm
Thêm npm vào path môi trường
Mở cmd tại thư mục chứa project muốn chạy.
Gõ “ npm install”
Chờ chạy xong thì gõ “ npm start”.
Bây giờ lên một browser bất kỳ, trang shop sẽ được chạy trên port 3000 : “localhost:3000” . Còn trang admin sẽ được chạy trên port 3001 : “localhost:3001”.


Deploy: heroku 
Tạo một app mới trong heroku dashboard
Database: 
Vào trang https://elements.heroku.com/addons/heroku-postgresql
Nhấn install heroku postgres
Chọn app mà bạn vừa tạo
Kết nối với database từ powershell với connect string: "postgres://YourUserName:YourPassword@YourHostname:5432/YourDatabaseName" các thông tin được lấy từ “https://data.heroku.com/” chọn database mình vừa tạo và vào setting=> view Credentials
Chạy script postgres.sql bằng “ \i ‘path/postgres.sql’ ”
Vào app từ heroku dashboard
Vào mục :deploy
Có thể cài đặt heroku CLI và deploy theo hướng dẫn
Hoặc sử dụng git bash:
git repository của heroku có dạng 
“https://git.heroku.com/YOUR_APP_NAME.git”
Từ terminal của git bash của 1 project có sẵn của chúng ta ta bắt đầu gõ: 
git init
git remote add heroku https://git.heroku.com/YOUR_APP_NAME.git
git add .
git commit -m “init”
git push heroku master ( hoặc là main)

