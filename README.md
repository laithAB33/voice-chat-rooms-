# voice-chat-rooms-

# socketIO is used as open connection 


# 🚀 Socket.io API Documentation

## 1️ إدارة الغرف (Room Management)
| الحدث (Event) | الجهة | البيانات (Payload) | الوصف |
| :--- | :---: | :--- | :--- |
| `join-room` | 📱 Client | `roomID` | طلب انضمام لغرفة |
| `room-joined` | 💻 Server | `{success, room, messages}` | تأكيد الدخول وإرسال البيانات |
| `user-joined` | 💻 Server | `{userName, participants}` | تنبيه الأعضاء بدخول مستخدم جديد |
| `leave-Room` | 📱 Client | `roomID` | طلب مغادرة الغرفة |
| `user-left` | 💻 Server | `{userName,message}` |  تنبيه الأعضاء بخروج العميل
| `room-left` | 💻 Server | `{success, message}` | تأكيد الخروج للعميل |

---

## 2️ المراسلات (Chat Module)
| الحدث (Event) | الجهة | البيانات (Payload) | الوصف |
| :--- | :---: | :--- | :--- |
| `send-message` | 📱 Client | `{message, messageType:(defualt:text), roomID,fileUrl:(optinal)}` | إرسال رسالة نصية أو ملف |
| `new-message` | 💻 Server | `{MassageID, userName, message}` | بث الرسالة لجميع أعضاء الغرفة |

---

## 3️ الصلاحيات الصوتية (Voice Access)
| الحدث (Event) | الجهة | البيانات (Payload) | الوصف |
| :--- | :---: | :--- | :--- |
| `request-voice-access` | 📱 Client | `roomID` | طلب تصريح للتحدث |
| `voice-access-granted` | 💻 Server | `{success, currentParticipants}` | الموافقة وفتح الميكروفون للعميل |
| `user-joined-voice` | 💻 Server | `{userId, username, isMuted}` | تنبيه الغرفة بأن العميل أصبح متحدثاً |

---

## 4️ البث والحالة الصوتية (Streaming)
| الحدث (Event) | الجهة | البيانات (Payload) | الوصف |
| :--- | :---: | :--- | :--- |
| `toggle-microphone` | 📱 Client | `{roomID, userID, isMuted}` | كتم أو تفعيل الميكروفون |
| `user-microphone-toggled` | 💻 Server | `{userId,username,isMuted}` | تنبيه الأعضاء بانه تغير حالة مايك العميل |
| `speaking-Status` | 📱 Client | `{roomID, userID, isSpeaking}` | إرسال حالة التحدث (توهج الأيقونة) |
| `user-speaking-status` | 💻 Server | `{userId,username, isSpeaking}` | تنبيه الأعضاء بحالة التحدث للعميل |
| `voice-data` | 📱 Client | `{roomID, userID, audioData}` | إرسال Stream الصوت الخام |
| `voice-data` | 💻 Server | `{userId, audioData}` | توزيع الصوت على المستمعين |

---

## 5 extra
| الحدث (Event) | الجهة | البيانات (Payload) | الوصف |
| :--- | :---: | :--- | :--- |
| `disconnect` | 📱 Client | no data | طلب ل فصل الاتصال |
| `user-disconnected` | 📱 Client | `{userName,message}` | تنبيه أعضاء الغرفة انقطاع اتصال العميل |
| `customError` | 💻 Server | `{success,message,code}` | في حال حدوث اي خطاء يرسل من خلالها |
