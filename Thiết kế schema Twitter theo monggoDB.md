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

### hashtags
- Hỗ trợ tìm kiếm theo hashtag.
- Mỗi tweet có thể có ít hashtag.
- Mỗi hashtag có rất nhiều tweet.
- ❌Không nên làm như dưới đây

```ts
interface Tweet {
  _id: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId //  chỉ null khi tweet gốc
  ❌hashtags:string[] // Không nên nhúng như thế này, vì sẽ gây khó khăn trong việc tìm kiếm những tweet nào có hashtag này, cũng như là gây lặp lại dữ liệu về tên hastag
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date

}
```
- => Quan hệ ít - rất nhiều

- Lưu một array ObjectId `hashtags` trong collection tweets

- Tạo ra một collection riêng để lưu `hashtags` và không lưu mảng `tweet_id` vào trong collection `hashtags`. Vì nếu lưu `tweet_id` vào trong collection `hashtags` thì sẽ dễ chạm đến giới hạn 16MB của MongoDB. Và cũng không cần thiết để lưu, vì khi search các tweet liên quan đến hashtag thì chúng ta sẽ dùng id hashtag để tìm kiếm trong collection tweets.

```ts
interface Hashtag {
  _id: ObjectId
  name: string
  created_at: Date
}
```



### Luồng tạo 1 tweet
- Ở đây mình sẽ giả sử một trường hợp tạo tweet đầy đủ hashtag, mention và media

- Một body đầy đủ sẽ như thế này

```ts
interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string //  chỉ null khi tweet gốc, không thì là tweet_id cha dạng string
  hashtags: string[] // tên của hashtag dạng ['javascript', 'reactjs']
  mentions: string[] // user_id[]
  medias: Media[]
}
```
- Validate Tweet body
- Nếu mà để validate pass 100% case của tweet thì rất tốn thời gian, nên mình sẽ validate những case chính. Tất nhiên nó sẽ dính 1 số case hiếm gặp, các bạn phát hiện thì tự bổ sung vào nhé.

- type phải là 1 trong 4 loại TweetType
- audience phải là 1 trong 2 loại TweetAudience
- Nếu type là retweet, comment, quotetweet thì `parent_id` phải là tweet_id của tweet cha, nếu type là tweet thì `parent_id` phải là null
- Nếu type là retweet thì content phải là ''. Nếu type là comment, quotetweet, tweet và không có mentions và hashtags thì content phải là string và không được rỗng.
- hashtags phải là mảng các string
- mentions phải là mảng các string dạng id
- medias phải là mảng các Media

```ts
- Schema validation Tweet
{
  "$jsonSchema": {
    "bsonType": "object",
    "title": "tweets object validation",
    "required": [
      "_id",
      "user_id",
      "type",
      "audience",
      "content",
      "parent_id",
      "hashtags",
      "mentions",
      "medias",
      "guest_views",
      "user_views",
      "created_at",
      "updated_at"
    ],
    "properties": {
      "_id": {
        "bsonType": "objectId",
        "description": "'_id' must be a ObjectId and is required"
      },
      "user_id": {
        "bsonType": "objectId",
        "description": "'user_id' must be a ObjectId and is required"
      },
      "type": {
        "bsonType": "int",
        "enum": [0, 1, 2, 3],
        "description": "'type' must be a TweetType and is required"
      },
      "audience": {
        "bsonType": "int",
        "enum": [0, 1],
        "description": "'audience' must be a TweetAudience and is required"
      },
      "content": {
        "bsonType": "string",
        "description": "'content' must be a string and is required"
      },
      "parent_id": {
        "bsonType": ["null", "objectId"],
        "description": "'parent_id' must be a null or ObjectId and is required"
      },
      "hashtags": {
        "bsonType": "array",
        "uniqueItems": true,
        "additionalProperties": false,
        "items": {
          "bsonType": "objectId"
        },
        "description": "'hashtags' must be a array and is required"
      },
      "mentions": {
        "bsonType": "array",
        "uniqueItems": true,
        "additionalProperties": false,
        "items": {
          "bsonType": "objectId"
        },
        "description": "'mentions' must be a array and is required"
      },
      "medias": {
        "bsonType": "array",
        "uniqueItems": true,
        "additionalProperties": false,
        "items": {
          "bsonType": "object",
          "required": ["url", "type"],
          "additionalProperties": false,
          "properties": {
            "type": {
              "enum": [0, 1, 2],
              "description": "'type' is required and can only be one of the given enum values"
            },
            "url": {
              "bsonType": "string",
              "description": "'url' is a required field of type string"
            }
          }
        },
        "description": "'medias' must be a array and is required"
      },
      "guest_views": {
        "bsonType": "int",
        "minimum": 0,
        "description": "'guest_views' must be a ObjectId and is required"
      },
      "user_views": {
        "bsonType": "int",
        "minimum": 0,
        "description": "'user_views' must be a number and is required"
      },
      "created_at": {
        "bsonType": "date",
        "description": "'created_at' must be a date and is required"
      },
      "updated_at": {
        "bsonType": "date",
        "description": "'updated_at' must be a date and is required"
      }
    },
    "additionalProperties": false
  }
}
```

### link figma cho db https://figma.com/board/6ZRdulYUzHkTwxr2N5IRVO/Untitled?node-id=2-153&t=E62SWB9wQkycoSOJ-0