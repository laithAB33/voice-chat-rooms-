# voice-chat-rooms-

# socketIO is used as open connection 


# 🚀 Socket.io API Documentation

## 1️ إدارة الغرف (Room Management)
| الحدث (Event) | الجهة | البيانات (Payload) | الوصف |
| :--- | :---: | :--- | :--- |
| `join-room` | 📱 Client | `roomID` | طلب انضمام لغرفة |
| `room-joined` | 💻 Server | `{success, room, messages}` | تأكيد الدخول وإرسال البيانات |
| `user-joined` | 💻 Server | `{userName, participants}` | تنبيه الأعضاء بدخول مستخدم جديد |
| `leave-Room` | 📱 Client | no data | طلب مغادرة الغرفة |
| `user-left` | 💻 Server | `{userName,message}` |  تنبيه الأعضاء بخروج العميل
| `room-left` | 💻 Server | `{success, message}` | تأكيد الخروج للعميل |
| `send-invitation` | 📱 Client | `{userID,roomID}` | ارسال دعوة للغرفة
| `invitation-sent` | 💻 Server | `{senderID,receiverIDroomID,delivered}` | تاكيد ارسال الدعوة
| `invitation-received` | 💻 Server | `{senderID,receiverID,roomID,delivered}` | استلام الدعوة
| `accept-invitation` | 📱 Client | `{userID,roomID,accept}` | ارسال قبول للدعوة
| `room-joined` | 💻 Server | `{success:true,room,messages,systemMessage}` | تاكيد انضمام
| `user-joined` | 💻 Server | `{userName,messages,timestamps,participants,isSpeaking,hasVoiceAccess}` | اعلام الغروب بدخول المستخدم

---

## 2️ المراسلات (Chat Module)
| الحدث (Event) | الجهة | البيانات (Payload) | الوصف |
| :--- | :---: | :--- | :--- |
| `send-message` | 📱 Client | `{message, messageType:(defualt:text),fileUrl:(optinal)}` | إرسال رسالة نصية أو ملف |
| `new-message` | 💻 Server | `{MassageID, userName, message}` | بث الرسالة لجميع أعضاء الغرفة |
| `privite-message` | 📱 Client | `{message, messageType:(defualt:text),fileUrl:(optinal),userID}` | ارسال رسالة نصية لشخص
| `message-sent` | 💻 Server | `{senderID,receiverID,message,messageType,delivered:}` | تأكيد ارسال الرسالة الخاصة
| `message-received` | 💻 Server | `{senderID,receiverID,message,messageType,delivered}` | استلام رسائل الخاصة
---

## 3️ الصلاحيات الصوتية (Voice Access)
| الحدث (Event) | الجهة | البيانات (Payload) | الوصف |
| :--- | :---: | :--- | :--- |
| `request-voice-access` | 📱 Client | no data | طلب تصريح للتحدث |
| `voice-access-granted` | 💻 Server | `{success, currentParticipants}` | الموافقة وفتح الميكروفون للعميل |
| `user-joined-voice` | 💻 Server | `{userId, username, isMuted}` | تنبيه الغرفة بأن العميل أصبح متحدثاً |
| `invite-to-microphone` | 📱 Client | `{userID,roomID}` | دعوة للمايك
| `invite-toMic-send` | 💻 Server | `{senderID,receiverID:userID,roomID,}` | تاكيد ارسال 
| `invite-toMic-received` | 💻 Server | `{senderID,receiverID,roomID}` | تاكيد استلام
| `accept-invitation-to-microphone` | 📱 Client | `{userID,roomID}` | قبول دعوة للمايك
| `joined-mic` | 💻 Serve | `{senderID,receiverID,roomID}` | تاكيد دخول المجموعة
| `user-joined-mic` | 💻 Serve | `{senderID,receiverID,roomID,messages,}` | اعلام الغرفة بدخول شخص للمجموعة

---

## 4️ البث والحالة الصوتية (Streaming)
| الحدث (Event) | الجهة | البيانات (Payload) | الوصف |
| :--- | :---: | :--- | :--- |
| `toggle-microphone` | 📱 Client | `{userID, isMuted}` | كتم أو تفعيل الميكروفون |
| `user-microphone-toggled` | 💻 Server | `{userId,username,isMuted}` | تنبيه الأعضاء بانه تغير حالة مايك العميل |
| `speaking-Status` | 📱 Client | `{roomID, userID, isSpeaking}` | إرسال حالة التحدث (توهج الأيقونة) |
| `user-speaking-status` | 💻 Server | `{userId,username, isSpeaking}` | تنبيه الأعضاء بحالة التحدث للعميل |
| `voice-data` | 📱 Client | `{data}` | إرسال Stream الصوت الخام |
| `voice-data` | 💻 Server | `{userId, audioData}` | توزيع الصوت على المستمعين |

---

## 5 extra
| الحدث (Event) | الجهة | البيانات (Payload) | الوصف |
| :--- | :---: | :--- | :--- |
| `disconnect` | 📱 Client | no data | طلب ل فصل الاتصال |
| `user-disconnected` | 📱 Client | `{userName,message}` | تنبيه أعضاء الغرفة انقطاع اتصال العميل |
| `customError` | 💻 Server | `{success,message,code}` | في حال حدوث اي خطاء يرسل من خلالها |
