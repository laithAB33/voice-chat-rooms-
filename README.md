# voice-chat-rooms-

# socketIO is used as open connection 


الحدث (Event),المستقبل (Listener),المدخلات (Payload),ما يحدث (Server Action)
join-room,Server,roomID,التحقق من الغرفة، إضافة المستخدم، جلب أرشيف الرسائل.
room-joined,Client,"{room, messages, systemMessage}",تأكيد الدخول وإرسال البيانات للعميل.
user-joined,Client,"{userName, participants}",إشعار بقية المستخدمين بانضمام عضو جديد.
leave-Room,Server,roomID,حذف المستخدم من الغرفة برمجياً.
room-left,Client,"{success, message}",تأكيد للمستخدم أنه غادر بنجاح.
disconnect,Server,(Automatic),تحديث lastSeen وحذف المستخدم من القوائم النشطة.