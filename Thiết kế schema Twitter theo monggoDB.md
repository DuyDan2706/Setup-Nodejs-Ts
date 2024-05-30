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

## refresh_tokens

 - Hệ thống sẽ dung jwt để xác thực người dùng.vậy mỗi lần người dùng đăng nhập thành công sẽ tạo ra 1 JWWT ACCESSTOKEN và 1 refresh token 

 - JWT access token thì không cần lưu vào db, vì chúng ta sẽ cho nó staless 
 - cón refesh token thì cần lưu vào database để tăng tính báo mật

- Một user thì có nhìu refresh token (không giới hạn) nên không thể lưu hết vào trong 1 collections  `user` được => quan hện 1 - nhìu

- và đôi lúc chúng ta chỉ cần quan tâm đên refresh token và không cần biết user là ai.vậy nên ta tạo 1 collection riêng để lưu refresh token 

``` ts
interface RefreshToken {
  _id: ObjectId
  token: string
  created_at: Date
  user_id: ObjectId
}

```

### followers

- Một người dùng có thể follow rất nhiều user khác, nếu dùng 1 mảng `followings` chứa ObjectId trong collection `users` thì sẽ không tối ưu. Vì dễ chạm đến giới hạn 16MB của MongoDB.

- Chưa hết, nếu dùng mảng `followings` thì khi muốn tìm kiếm user A đang follow ai rất dễ nhưng ngược lại, tìm kiếm ai đang follow user A thì lại rất khó.

- Vậy nên ta tạo ra một collection riêng để lưu các mối quan hệ follow giữa các user là hợp lý hơn cả.

- 1 user có rất nhiều follower, và 1 follower cũng có rất nhiều user khác follow lại => Quan hệ rất nhiều - rất nhiều

```ts
interface Follower {
  _id: ObjectId
  user_id: ObjectId
  followed_user_id: ObjectId
  created_at: Date
}
```

### tweets
- Chúng ta sẽ chọn ra những tính năng chính của tweet để clone

- Tweet có thể chứa `text`, `hashtags`, `metions`, `ảnh`, `video`
- Tweet có thể hiển thị cho everyone hoặc Twitter Circle
- Tweet có thể quy định người reply (everyone, người mà chúng ta follow , người chúng ta metion)
- Tweet sẽ có nested tweet, nghĩa là tweet có thể chứa tweet con bên trong. Nếu dùng theo kiểu nested object sẽ không phù hợp, vì sớm thôi, nó sẽ chạm đến giới hạn. Chưa kể query thông tin 1 tweet con rất khó. (bình luận)
- Vậy nên ta sẽ lưu trường `parent_id` để biết tweet này là con của ai. Nếu `parent_id` là null thì đó là tweet gốc.

- Nếu là tweet bình thường thì sẽ có content là string. Còn nếu là retweet thì sẽ không có content mà chỉ có `parent_id` thôi, lúc này có thể cho content là '' hoặc null, như mình phân tích ở những bài trước thì mình thích để '' hơn, đỡ phải phân tích trường hợp null. Vậy nên content có thể là string.
- Nếu là '' thì sẽ chiếm bộ nhớ hơn là null, nhưng điều này là không đáng kể so với lợi ích nó đem lại

- audience đại diện cho tính riêng tư của tweet. Ví dụ tweet có thể là public cho mọi người xem hoặc chỉ cho nhóm người nhất định. Vậy nên visibility có thể là TweetAudience enum.

- type đại diện cho loại tweet. Ví dụ tweet, retweet, quote tweet.

- hashtag là mảng chứa `ObjectId` của các hashtag. Vì mỗi tweet có thể có nhiều hashtag. Vậy nên hashtag có thể là `ObjectId[]`.

- mentions là mảng chứa `ObjectId` của các user được mention. Vì mỗi tweet có thể có nhiều user được mention. Vậy nên mentions có thể là `ObjectId[]`.

- medias là mảng chứa `ObjectId` của các media. Vì mỗi tweet chỉ có thể có 1 vài media. Nếu upload ảnh thì sẽ không upload được video và ngược lại. Vậy nên medias có thể là Media[].

- Bên twitter sẽ có rất là nhiều chỉ số để phân tích lượt tiếp cận của 1 tweet. Trong giới hạn của khóa học thì chúng ta chỉ phân tích lượt view thôi.

- Lượt view thì chúng ta chia ra làm 2 loại là `guest_views` là số lượng lượt xem của tweet từ người dùng không đăng nhập và `user_views` là dành cho đã đăng nhập. 2 trường này mình sẽ cho kiểu dữ liệu là `number`.

```ts
interface Tweet {
  _id: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId //  chỉ null khi tweet gốc
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date
}
interface Media {
  url: string
  type: MediaType // video, image
}
enum MediaType {
  Image,
  Video
}
enum TweetAudience {
  Everyone, // 0
  TwitterCircle // 1
}
enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}
```

## bookmarks

- Bookmark các tweet lại, mỗi user không giới hạn số lượng bookmark. Sở dĩ không cần updated_at là vì trong trường hợp người dùng unbookmark thì chúng ta sẽ xóa document này đi.
- boookmark dùng để lưu lại thui
```ts
interface Bookmark {
  _id: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at: Date
}
```