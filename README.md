ggiải thích các thư mục:

dist: Thư mục chứa các file build
src: Thư mục chứa mã nguồn
src/constants: Chứa các file chứa các hằng số
src/middlewares: Chứa các file chứa các hàm xử lý middleware, như validate, check token, ...
src/controllers: Chứa các file nhận request, gọi đến service để xử lý logic nghiệp vụ, trả về response
src/services: Chứa các file chứa method gọi đến database để xử lý logic nghiệp vụ
src/models: Chứa các file chứa các model
src/routes: Chứa các file chứa các route
src/utils: Chứa các file chứa các hàm tiện ích, như mã hóa, gửi email, ...

1.Khởi tạo dự án
npm init -y
2.Thêm TypeScript như một dev dependency
npm install typescript --save-dev
3.Cài đặt kiểu dữ liệu TypeScript cho Node.js
npm install @types/node --save-dev
4.Cài đặt các package config cần thiết còn lại
npm install eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser ts-node tsc-alias tsconfig-paths rimraf nodemon --save-dev

giải thích
eslint: Linter (bộ kiểm tra lỗi) chính
prettier: Code formatter chính
eslint-config-prettier: Cấu hình ESLint để không bị xung đột với Prettier
eslint-plugin-prettier: Dùng thêm một số rule prettier cho eslint
@typescript-eslint/eslint-plugin: ESLint plugin cung cấp các rule cho Typescript
@typescript-eslint/parser: Parser cho phép ESLint kiểm tra lỗi Typescript
ts-node: Dùng để chạy TypeScript code trực tiếp mà không cần build
tsc-alias: Xử lý alias khi build
tsconfig-paths: Khi setting alias import trong dự án dùng ts-node thì chúng ta cần dùng tsconfig-paths để nó hiểu được paths và baseUrl trong file tsconfig.json
rimraf: Dùng để xóa folder dist khi trước khi build
nodemon: Dùng để tự động restart server khi có sự thay đổi trong code
