# thiết kế Schema Twiter bằng MongoDB

Một số  ghi chú 

- Tên collection nên được đặt theo dạng số nhiều, kiếu snake_case ví dụ `users`,`refresh_token`


- Tên field nên đặt theo dạng snake_case, ví dụ `email_verify_token`,`forot_password_token`

- `_id` là truownfgg đucợ monggodb tự động tạo ra không phải thêm trường `_id` vào.Cũn khoongg nên tìm mọi cách đổi tên `_id ` thành `id` hay theay đổi cơ chế của nó vì nếu làm vậy sẽ làm giảm hiệu xuất của MonggooDb

- Trường `created_At`, `updated_at` nên có kiểu `Date` dể dễ danggf sắp xếp tìm kieems và lọc theo thời gian 

- Trường  `created_At` nên luôn luôn được thêm vào khi tạo mới document

- Trường  `updated_at` thì optional


- tất cả trường đại diện id của document thì nên có kiểu `objectId`


# phân tích chức năng

 # user 

  - người dùng đăng ký nhập `name `, `email` , `day_of_birth`,`password` là được.vậy  `name `, `email` , `day_of_birth`,`password`  là nhuwnxgg trường bắt buộc phải có bên cạnh `_id ` là trường tự động bơi MonoDb 

  - Sau khi đăng ký xonbgg thì sẽ có email đính kèm `email_veryfy_token `để xác thực email (`tranduydan.com/verify_email?email_veryfy_token=12321212`) . user chỉ có 1 `email_veryfy_token `  duy nhất vì nếu user nhấn resend email thì sẽ tại ra `email_veryfy_token ` mới thay thế cái cũ vạy nên ta lưu thêm trường `email_veryfy_token ` vào schema `User`. Trường này có kiểu `Stringg` nếu user xác thực email thì ta set `" `

  - tuonwgg tự ta có chức năng quên mặt khẩu thì sẽ gữi mail về đẻ reset mật khẩu ta cũng dung `forgot_pasword_token` để xác thực . Vạy ta có thể lưu thêm trưởng f `forgot_pasword_token` vào schema User .Trường anfy `string` nếu user reset makeet kaaur thì set `""`

   - Nếu có một trường `veryfy` để biết trạng thái tài khoản của user. Ví dụ chưa xác thực email, đã xác thực bị khóa lên tích xanh vậy giá trị của nó nên là enum 

   - Người dùng có thể update các thoongg tin cho profile : `bio`, `location`,`website`, `usernaem `,`avatar`,`cover_phôt`.vạy t ta cũng lưu trường này vào schema User với kiểu `string`.,`avatar`,`cover_photto` đơn giản chỉ là string url thôi.Dây là những giá trị optinal tức người dùng không nhập vào thì vẫn dùng bình thường.nhưng cũng lưu và set `'` khi người dunggf không nhập để tiện quản lú


   - Cuois cùng là trường `Create_at`,`Updated_At` để biết thời gian tạo và cập nhật user .vậy ta lưu theem 2 trường hợp 
 
  ```ts
  enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
  }
  
  interface User {
  _id: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at: Date
  updated_at: Date
  email_verify_token: string // jwt hoặc '' nếu đã xác thực email
  forgot_password_token: string // jwt hoặc '' nếu đã xác thực email
  verify: UserVerifyStatus

  bio: string // optional
  location: string // optional
  website: string // optional
  username: string // optional
  avatar: string // optional
  cover_photo: string // optional
  }
  ```
