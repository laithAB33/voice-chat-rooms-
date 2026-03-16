# voice-chat-rooms-

# socketIO is used as open connection 


# 🚀 Socket.io API Documentation

<!-- ## 1️⃣ إدارة الغرف (Room Management)
| الحدث (Event) | الجهة | البيانات (Payload) | الوصف |
| :--- | :---: | :--- | :--- |
| `join-room` | 📱 Client | `roomID` | طلب انضمام لغرفة |
| `room-joined` | 💻 Server | `{success, room, messages}` | تأكيد الدخول وإرسال البيانات |
| `user-joined` | 💻 Server | `{userName, participants}` | تنبيه الأعضاء بدخول مستخدم جديد |
| `leave-Room` | 📱 Client | `roomID` | طلب مغادرة الغرفة |
| `room-left` | 💻 Server | `{success, message}` | تأكيد الخروج للعميل |

---

## 2️⃣ المراسلات (Chat Module)
| الحدث (Event) | الجهة | البيانات (Payload) | الوصف |
| :--- | :---: | :--- | :--- |
| `send-message` | 📱 Client | `{message, messageType, roomID}` | إرسال رسالة نصية أو ملف |
| `new-message` | 💻 Server | `{MassageID, userName, message}` | بث الرسالة لجميع أعضاء الغرفة |

---

## 3️⃣ الصلاحيات الصوتية (Voice Access)
| الحدث (Event) | الجهة | البيانات (Payload) | الوصف |
| :--- | :---: | :--- | :--- |
| `request-voice-access` | 📱 Client | `roomID` | طلب تصريح للتحدث |
| `voice-access-granted` | 💻 Server | `{success, currentParticipants}` | الموافقة وفتح الميكروفون للعميل |
| `user-joined-voice` | 💻 Server | `{userId, username, isMuted}` | تنبيه الغرفة بأن العميل أصبح متحدثاً |

---

## 4️⃣ البث والحالة الصوتية (Streaming)
| الحدث (Event) | الجهة | البيانات (Payload) | الوصف |
| :--- | :---: | :--- | :--- |
| `toggle-microphone` | 📱 Client | `{roomID, userID, isMuted}` | كتم أو تفعيل الميكروفون |
| `speaking-Status` | 📱 Client | `{roomID, userID, isSpeaking}` | إرسال حالة التحدث (توهج الأيقونة) |
| `voice-data` | 📱 Client | `{roomID, userID, audioData}` | إرسال Stream الصوت الخام |
| `voice-data` | 💻 Server | `{userId, audioData}` | توزيع الصوت على المستمعين | -->

# 🚀 Socket.io Technical Documentation (Full Details)

## 1️⃣ Room Management & Presence
| Event (Listen) | Direction | Payload (Data) | Response / Broadcast |
| :--- | :---: | :--- | :--- |
| `join-room` | `C -> S` | `roomID` | **Emit (`room-joined`):** `{success, room: {id, name, description, participants, participantCount}, messages: [], systemMessage: {id, message}}` <br> **Broadcast (`user-joined`):** `{userName, messages, timestamps, participants, isSpeaking, hasVoiceAccess}` |
| `leave-Room` | `C -> S` | `roomID` | **Emit (`room-left`):** `{success, message}` <br> **Broadcast (`user-left`):** `{userName, message, timestamps, participants, systemMessage: {id, message, timestamp}}` |
| `disconnect` | `System` | `None` | **Broadcast (`user-disconnected`):** `{userName, message, timestamp, systemMessage: {id, message, timestamp}}` |

---

## 2️⃣ Messaging System
| Event (Listen) | Direction | Payload (Data) | Response / Broadcast |
| :--- | :---: | :--- | :--- |
| `send-message` | `C -> S` | `{message, messageType, fileUrl, roomID}` | **Broadcast (`new-message`):** `{MassageID, userID, userName, profileImage, message, messageType, file, timestamp}` |

---

## 3️⃣ Voice Access Control
| Event (Listen) | Direction | Payload (Data) | Response / Broadcast |
| :--- | :---: | :--- | :--- |
| `request-voice-access` | `C -> S` | `roomID` | **Emit (`voice-access-granted`):** `{success, message, currentVoiceParticipants}` <br> **Broadcast (`user-joined-voice`):** `{userId, username, isMuted, isSpeaking, currentVoiceParticipants}` |
| `toggle-microphone` | `C -> S` | `{roomID, userID, isMuted}` | **Broadcast (`user-microphone-toggled`):** `{userId, username, isMuted}` |
| `speaking-Status` | `C -> S` | `{roomID, userID, isSpeaking}` | **Broadcast (`user-speaking-status`):** `{userId, username, isSpeaking}` |

---

## 4️⃣ Real-time Voice Streaming
| Event (Listen) | Direction | Payload (Data) | Response / Broadcast |
| :--- | :---: | :--- | :--- |
| `voice-data` | `C -> S` | `{roomID, userID, audioData}` | **Broadcast to others (`voice-data`):** `{userId, audioData}` |

---

### 📝 ملاحظات تقنية هامة للـ Frontend:
* **System Messages:** تذكر أن السيرفر يرسل `messageType: 'system'` عند دخول أو خروج مستخدم، يجب تمييز شكلها في التصميم.
* **Voice Access:** لا يمكن إرسال `voice-data` إلا بعد استقبال `voice-access-granted`.
* **Populated Data:** لاحظ أن السيرفر يقوم بعمل `populate` لبيانات المستخدم (الاسم والصورة الشخصية) في أحداث الرسائل، فلا داعي لتخزينها محلياً لكل رسالة.