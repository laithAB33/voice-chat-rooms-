
// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const mongoose = require('mongoose');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//     }
// });

// // =============================================
// // 📊 تخزين مؤقت للبيانات (لأغراض الأداء)
// // =============================================
// const activeRooms = new Map(); // تخزين الغرف النشطة في الذاكرة
// const userSockets = new Map(); // تتبع اتصالات المستخدمين

// // =============================================
// // 🔌 حدث الاتصال الأساسي
// // =============================================
// io.on('connection', (socket) => {
//     console.log(`🔗 [${socket.id}] مستخدم متصل`);

//     // تخزين بيانات الاتصال الأساسية
//     socket.userData = {
//         socketId: socket.id,
//         userId: null,
//         currentRoom: null,
//         hasVoice: false,
//         voiceSeat: null,
//         joinedAt: new Date()
//     };

//     // =============================================
//     // 1. 🏠 الانضمام للغرفة (الدردشة النصية)
//     // =============================================
//     socket.on('join-room', async (data) => {
//         try {
//             const { roomId, userId, username } = data;
//             console.log(`🚪 [${socket.id}] طلب انضمام للغرفة ${roomId}`);

//             // ✅ التحقق من البيانات
//             if (!roomId || !userId) {
//                 return socket.emit('error', {
//                     code: 'MISSING_DATA',
//                     message: 'بيانات الانضمام ناقصة'
//                 });
//             }

//             // ✅ تحديث بيانات المستخدم
//             socket.userData.userId = userId;
//             socket.userData.username = username;
//             userSockets.set(userId, socket.id);

//             // ✅ البحث عن الغرفة في قاعدة البيانات
//             const room = await Room.findOne({ roomId });
//             if (!room) {
//                 return socket.emit('error', {
//                     code: 'ROOM_NOT_FOUND', 
//                     message: 'الغرفة غير موجودة'
//                 });
//             }

//             // ✅ التحقق من وجود المستخدم في الغرفة مسبقاً
//             const existingParticipant = await RoomParticipant.findOne({
//                 room: room._id,
//                 user: userId
//             });

//             if (existingParticipant) {
//                 return socket.emit('error', {
//                     code: 'ALREADY_IN_ROOM',
//                     message: 'أنت بالفعل في هذه الغرفة'
//                 });
//             }

//             // ✅ الانضمام لغرفة السوكيت
//             socket.join(roomId);
//             socket.userData.currentRoom = roomId;

//             // ✅ تسجيل المشارك في قاعدة البيانات
//             const participant = new RoomParticipant({
//                 room: room._id,
//                 user: userId,
//                 socketId: socket.id,
//                 username: username,
//                 hasVoiceAccess: false,
//                 voiceSeatNumber: null,
//                 isMuted: false,
//                 isSpeaking: false
//             });
//             await participant.save();

//             // ✅ تحديث عدد المشاركين
//             room.currentParticipants += 1;
//             await room.save();

//             // ✅ تحديث البيانات المؤقتة
//             if (!activeRooms.has(roomId)) {
//                 activeRooms.set(roomId, {
//                     roomId: roomId,
//                     name: room.name,
//                     participants: new Map(),
//                     voiceParticipants: new Map()
//                 });
//             }

//             const roomData = activeRooms.get(roomId);
//             roomData.participants.set(userId, {
//                 userId,
//                 username,
//                 socketId: socket.id,
//                 hasVoice: false,
//                 voiceSeat: null,
//                 isMuted: false,
//                 isSpeaking: false
//             });

//             // 📤 جلب بيانات الغرفة الحالية
//             const participants = await RoomParticipant.find({ room: room._id })
//                 .sort({ joinedAt: 1 });


// const voiceParticipants = participants.filter(p => p.hasVoiceAccess);

//             // 🎯 إرسال استجابة النجاح للمستخدم الجديد
//             socket.emit('room-joined', {
//                 success: true,
//                 room: {
//                     roomId: room.roomId,
//                     name: room.name,
//                     maxVoiceParticipants: room.maxVoiceParticipants,
//                     currentParticipants: room.currentParticipants
//                 },
//                 yourData: {
//                     userId: userId,
//                     username: username,
//                     hasVoiceAccess: false,
//                     voiceSeatNumber: null
//                 },
//                 allParticipants: participants.map(p => ({
//                     userId: p.user,
//                     username: p.username,
//                     hasVoiceAccess: p.hasVoiceAccess,
//                     voiceSeatNumber: p.voiceSeatNumber,
//                     isMuted: p.isMuted,
//                     isSpeaking: p.isSpeaking
//                 })),
//                 voiceParticipants: voiceParticipants.map(p => ({
//                     userId: p.user,
//                     username: p.username,
//                     socketId: p.socketId,
//                     voiceSeatNumber: p.voiceSeatNumber,
//                     isMuted: p.isMuted,
//                     isSpeaking: p.isSpeaking
//                 }))
//             });

//             // 📢 إعلام الآخرين بانضمام مستخدم جديد
//             socket.to(roomId).emit('user-joined-room', {
//                 userId: userId,
//                 username: username,
//                 hasVoiceAccess: false,
//                 voiceSeatNumber: null,
//                 isMuted: false,
//                 isSpeaking: false
//             });

//             console.log(✅ [${socket.id}] ${username} انضم للغرفة ${room.name});

//         } catch (error) {
//             console.error(❌ [${socket.id}] خطأ في الانضمام:, error);
//             socket.emit('error', {
//                 code: 'JOIN_ERROR',
//                 message: 'فشل في الانضمام للغرفة'
//             });
//         }
//     });

//     // =============================================
//     // 2. 🎤 طلب الانضمام للمحادثة الصوتية
//     // =============================================
//     socket.on('request-voice-access', async (data) => {
//         try {
//             const { roomId, userId } = data;

//             // ✅ التحقق من وجود المستخدم في الغرفة
//             if (!socket.currentRoom || socket.currentRoom !== roomId) {
//                 return socket.emit('error', {
//                     code: 'NOT_IN_ROOM',
//                     message: 'يجب الانضمام للغرفة أولاً'
//                 });
//             }

//             const room = await Room.findOne({ roomId });
//             const participant = await RoomParticipant.findOne({
//                 room: room._id,
//                 user: userId,
//                 socketId: socket.id
//             });

//             if (!participant) {
//                 return socket.emit('error', {
//                     code: 'PARTICIPANT_NOT_FOUND',
//                     message: 'لم يتم العثور على بيانات المشارك'
//                 });
//             }

//             // ✅ التحقق من وجود صلاحية صوت مسبقاً
//             if (participant.hasVoiceAccess) {
//                 return socket.emit('error', {
//                     code: 'ALREADY_HAS_VOICE',
//                     message: 'لديك صلاحية صوت بالفعل'
//                 });
//             }

//             // ✅ التحقق من توفر مقاعد صوتية
//             const currentVoiceCount = await RoomParticipant.countDocuments({
//                 room: room._id,
//                 hasVoiceAccess: true
//             });

//             if (currentVoiceCount >= room.maxVoiceParticipants) {
//                 return socket.emit('error', {
//                     code: 'NO_VOICE_SEATS',
//                     message: 'لا توجد مقاعد صوتية شاغرة'
//                 });
//             }
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
// // ✅ تحديد المقعد الشاغر التالي
//             const usedSeats = await RoomParticipant.find({
//                 room: room._id,
//                 hasVoiceAccess: true
//             }).select('voiceSeatNumber');

//             const usedSeatNumbers = usedSeats.map(p => p.voiceSeatNumber);
//             let availableSeat = 1;

//             while (usedSeatNumbers.includes(availableSeat) && availableSeat <= room.maxVoiceParticipants) {
//                 availableSeat++;
//             }

//             if (availableSeat > room.maxVoiceParticipants) {
//                 return socket.emit('error', {
//                     code: 'NO_AVAILABLE_SEATS',
//                     message: 'لا توجد مقاعد متاحة'
//                 });
//             }

//             // ✅ منح صلاحية الصوت
//             participant.hasVoiceAccess = true;
//             participant.voiceSeatNumber = availableSeat;
//             participant.isMuted = false;
//             await participant.save();

//             // ✅ تحديث البيانات المؤقتة
//             socket.userData.hasVoice = true;
//             socket.userData.voiceSeat = availableSeat;

//             const roomData = activeRooms.get(roomId);
//             if (roomData) {
//                 const userData = roomData.participants.get(userId);
//                 if (userData) {
//                     userData.hasVoice = true;
//                     userData.voiceSeat = availableSeat;
//                     roomData.voiceParticipants.set(userId, userData);
//                 }
//             }

//             // ✅ الانضمام للغرفة الصوتية
//             socket.join(voice-${roomId});

//             // 📤 جلب المشاركين الصوتيين الحاليين
//             const voiceParticipants = await RoomParticipant.find({
//                 room: room._id,
//                 hasVoiceAccess: true
//             });

//             // 🎯 إرسال تأكيد منح الصوت
//             socket.emit('voice-access-granted', {
//                 success: true,
//                 voiceSeatNumber: availableSeat,
//                 message: 'تم منح صلاحية الصوت بنجاح',
//                 currentVoiceParticipants: voiceParticipants.map(p => ({
//                     userId: p.user,
//                     username: p.username,
//                     socketId: p.socketId,
//                     voiceSeatNumber: p.voiceSeatNumber,
//                     isMuted: p.isMuted,
//                     isSpeaking: p.isSpeaking
//                 }))
//             });

//             // 📢 إعلام جميع المستخدمين في الغرفة
//             io.to(roomId).emit('user-joined-voice', {
//                 userId: userId,
//                 username: participant.username,
//                 voiceSeatNumber: availableSeat,
//                 isMuted: false,
//                 isSpeaking: false,
//                 currentVoiceParticipants: voiceParticipants.map(p => ({
//                     userId: p.user,
//                     username: p.username,
//                     socketId: p.socketId,
//                     voiceSeatNumber: p.voiceSeatNumber,
//                     isMuted: p.isMuted,
//                     isSpeaking: p.isSpeaking
//                 }))
//             });

//             console.log(✅ [${socket.id}] منح الصوت في المقعد ${availableSeat});

//         } catch (error) {
//             console.error(❌ [${socket.id}] خطأ في طلب الصوت:, error);
//             socket.emit('error', {
//                 code: 'VOICE_REQUEST_ERROR',
//                 message: 'فشل في طلب الصوت'
//             });
//         }
//     });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // =============================================
    // 3. 🔇 إدارة حالة الميكروفون
    // =============================================
    // socket.on('toggle-microphone', async (data) => {
    //     try {
    //         const { roomId, userId, isMuted } = data;


    //         // ✅ التحقق من صلاحية الصوت
    //         if (!socket.userData.hasVoice) {
    //             return socket.emit('error', {
    //                 code: 'NO_VOICE_ACCESS',
    //                 message: 'ليس لديك صلاحية صوت'
    //             });
    //         }
            
            // const room = await Room.findOne({ roomId });
            // const participant = await RoomParticipant.findOne({
            //     room: room._id,
            //     user: userId,
            //     socketId: socket.id,
            //     hasVoiceAccess: true
            // });

            // if (!participant) {
            //     return socket.emit('error', {
            //         code: 'VOICE_ACCESS_REVOKED',
            //         message: 'تم سحب صلاحية الصوت'
            //     });
            // }

            // // ✅ تحديث حالة الميكروفون
            // participant.isMuted = isMuted;
            // await participant.save();

    //         // ✅ تحديث البيانات المؤقتة
    //         const roomData = activeRooms.get(roomId);
    //         if (roomData) {
    //             const userData = roomData.participants.get(userId);
    //             if (userData) {
    //                 userData.isMuted = isMuted;
    //             }
    //         }

    //         // 📢 إعلام جميع المستخدمين في الغرفة
    //         io.to(roomId).emit('user-microphone-toggled', {
    //             userId: userId,
    //             username: participant.username,
    //             isMuted: isMuted,
    //             voiceSeatNumber: participant.voiceSeatNumber
    //         });

    //         console.log(✅ [${socket.id}] تم ${isMuted ? 'كتم' : 'تفعيل'} الميكروفون);

    //     } catch (error) {
    //         console.error(❌ [${socket.id}] خطأ في تبديل الميكروفون:, error);
    //         socket.emit('error', {
    //             code: 'TOGGLE_MIC_ERROR',
    //             message: 'فشل في تبديل الميكروفون'
    //         });
    //     }
    // });

    // =============================================
    // 4. 🗣️ تحديث حالة التحدث
    // =============================================
    // socket.on('speaking-status', async (data) => {
    //     try {
    //         const { roomId, userId, isSpeaking } = data;

    //         // ✅ التحقق من صلاحية الصوت
    //         if (!socket.userData.hasVoice) return;

    //         const room = await Room.findOne({ roomId });
    //         const participant = await RoomParticipant.findOne({
    //             room: room._id,
    //             user: userId,
    //             socketId: socket.id,
    //             hasVoiceAccess: true
    //         });

    //         if (!participant) return;

    //         // ✅ تحديث حالة التحدث
    //         participant.isSpeaking = isSpeaking;
    //         await participant.save();

    //         // ✅ تحديث البيانات المؤقتة
    //         const roomData = activeRooms.get(roomId);
    //         if (roomData) {
    //             const userData = roomData.participants.get(userId);
    //             if (userData) {
    //                 userData.isSpeaking = isSpeaking;
    //             }
    //         }

    //         // 📢 إعلام جميع المستخدمين في الغرفة
    //         socket.to(roomId).emit('user-speaking-status', {
    //             userId: userId,
    //             username: participant.username,
    //             isSpeaking: isSpeaking,
    //             voiceSeatNumber: participant.voiceSeatNumber
    //         });

    //     } catch (error) {
    //         console.error(❌ [${socket.id}] خطأ في تحديث حالة التحدث:, error);
    //     }
    // });

    // =============================================
    // 5. 📞 إشارات WebRTC (للاتصال المباشر بين العملاء)
    // =============================================

    // 📞 إرسال عرض اتصال
    socket.on('webrtc-offer', (data) => {
        const { targetSocketId, offer, fromUserId } = data;

        socket.to(targetSocketId).emit('webrtc-offer', {
            offer: offer,
            fromSocketId: socket.id,
            fromUserId: fromUserId
        });
    });

    // 📞 إرسال إجابة اتصال
    socket.on('webrtc-answer', (data) => {
        const { targetSocketId, answer } = data;

        socket.to(targetSocketId).emit('webrtc-answer', {
            answer: answer,
            fromSocketId: socket.id
        });
    });

// 📞 إرسال مرشح الشبكة (ICE Candidate)
    socket.on('ice-candidate', (data) => {
        const { targetSocketId, candidate } = data;
        
        socket.to(targetSocketId).emit('ice-candidate', {
            candidate: candidate,
            fromSocketId: socket.id
        });
    });

    // =============================================
    // 6. 🚪 مغادرة المحادثة الصوتية
    // =============================================
    socket.on('leave-voice', async (data) => {
        try {
            const { roomId, userId } = data;
            console.log(🔇 [${socket.id}] مغادرة الصوت من ${userId});

            const room = await Room.findOne({ roomId });
            const participant = await RoomParticipant.findOne({
                room: room._id,
                user: userId,
                socketId: socket.id,
                hasVoiceAccess: true
            });

            if (!participant) {
                return socket.emit('error', {
                    code: 'NO_VOICE_ACCESS',
                    message: 'ليس لديك صلاحية صوت'
             });
            }

            const seatNumber = participant.voiceSeatNumber;

            // ✅ إلغاء صلاحية الصوت
            participant.hasVoiceAccess = false;
            participant.voiceSeatNumber = null;
            participant.isMuted = false;
            participant.isSpeaking = false;
            await participant.save();

            // ✅ تحديث البيانات المؤقتة
            socket.userData.hasVoice = false;
            socket.userData.voiceSeat = null;

            const roomData = activeRooms.get(roomId);
            if (roomData) {
                const userData = roomData.participants.get(userId);
                if (userData) {
                    userData.hasVoice = false;
                    userData.voiceSeat = null;
                    userData.isMuted = false;
                    userData.isSpeaking = false;
                    roomData.voiceParticipants.delete(userId);
                }
            }

            // ✅ مغادرة الغرفة الصوتية
            socket.leave(voice-${roomId});

            // 📤 جلب المشاركين الصوتيين المتبقين
            const remainingVoiceParticipants = await RoomParticipant.find({
                room: room._id,
                hasVoiceAccess: true
            });

            // 🎯 إرسال تأكيد المغادرة
            socket.emit('voice-left', {
                success: true,
                message: 'تم مغادرة المحادثة الصوتية'
            });

            // 📢 إعلام جميع المستخدمين في الغرفة
            io.to(roomId).emit('user-left-voice', {
                userId: userId,
                username: participant.username,
                voiceSeatNumber: seatNumber,
                currentVoiceParticipants: remainingVoiceParticipants.map(p => ({
                    userId: p.user,
                    username: p.username,
                    socketId: p.socketId,
                    voiceSeatNumber: p.voiceSeatNumber,
                    isMuted: p.isMuted,
                    isSpeaking: p.isSpeaking
                }))
            });

            console.log(✅ [${socket.id}] غادر المحادثة الصوتية);

        } catch (error) {
            console.error(❌ [${socket.id}] خطأ في مغادرة الصوت:, error);
            socket.emit('error', {
                code: 'LEAVE_VOICE_ERROR',
                message: 'فشل في مغادرة الصوت'
            });
        }
    });

    // =============================================
    // 7. 🏃‍♂️ مغادرة الغرفة تماماً
    // =============================================
    socket.on('leave-room', async (data) => {
        try {
            const { roomId, userId } = data;
            console.log(🚪 [${socket.id}] مغادرة الغرفة من ${userId});

            const room = await Room.findOne({ roomId });
            const participant = await RoomParticipant.findOne({
                room: room._id,
                user: userId,
                socketId: socket.id
            });

            if (!participant) return;

laith, [25/10/2025 06:09 م]
const hadVoiceAccess = participant.hasVoiceAccess;
            const voiceSeatNumber = participant.voiceSeatNumber;
            const username = participant.username;

            // ✅ حذف المشارك من قاعدة البيانات
            await RoomParticipant.deleteOne({ _id: participant._id });

            // ✅ تحديث عدد المشاركين
            room.currentParticipants = Math.max(0, room.currentParticipants - 1);
            await room.save();

            // ✅ تحديث البيانات المؤقتة
            const roomData = activeRooms.get(roomId);
            if (roomData) {
                roomData.participants.delete(userId);
                if (hadVoiceAccess) {
                    roomData.voiceParticipants.delete(userId);
                }
                
                // إذا كانت الغرفة فارغة، حذفها من الذاكرة
                if (roomData.participants.size === 0) {
                    activeRooms.delete(roomId);
                }
            }

            userSockets.delete(userId);

            // ✅ مغادرة جميع الغرف
            socket.leave(roomId);
            if (hadVoiceAccess) {
                socket.leave(voice-${roomId});
            }

            // 📢 إعلام جميع المستخدمين في الغرفة
            if (hadVoiceAccess) {
                io.to(roomId).emit('user-left-voice', {
                    userId: userId,
                    username: username,
                    voiceSeatNumber: voiceSeatNumber
                });
            }

            io.to(roomId).emit('user-left-room', {
                userId: userId,
                username: username
            });

            // 🎯 إرسال تأكيد للمستخدم
            socket.emit('room-left', {
                success: true,
                message: 'تم مغادرة الغرفة'
            });

            console.log(✅ [${socket.id}] ${username} غادر الغرفة);

        } catch (error) {
            console.error(❌ [${socket.id}] خطأ في مغادرة الغرفة:, error);
            socket.emit('error', {
                code: 'LEAVE_ROOM_ERROR',
                message: 'فشل في مغادرة الغرفة'
            });
        }
    });

    // =============================================
    // 8. 💬 إرسال رسائل الدردشة النصية
    // =============================================
    socket.on('send-message', async (data) => {
        try {
            const { roomId, userId, username, message } = data;
            
            if (!message || message.trim() === '') return;

            // 📢 بث الرسالة لجميع المستخدمين في الغرفة
            io.to(roomId).emit('new-message', {
                userId: userId,
                username: username,
                message: message.trim(),
                timestamp: new Date().toISOString(),
                messageId: Math.random().toString(36).substr(2, 9)
            });

            console.log(💬 [${socket.id}] ${username}: ${message});

        } catch (error) {
            console.error(❌ [${socket.id}] خطأ في إرسال الرسالة:, error);
        }
    });

    // =============================================
    // 9. 🔌 التعامل مع انقطاع الاتصال
    // =============================================
    socket.on('disconnect', async (reason) => {
        try {
            console.log(🔌 [${socket.id}] انقطع الاتصال: ${reason});

            const { userId, currentRoom } = socket.userData;

            if (userId && currentRoom) {
                const room = await Room.findOne({ roomId: currentRoom });
                const participant = await RoomParticipant.findOne({
                    room: room._id,
                    user: userId,
                    socketId: socket.id
                });

                if (participant) {
                    const hadVoiceAccess = participant.hasVoiceAccess;
                    const voiceSeatNumber = participant.voiceSeatNumber;
                    const username = participant.username;

                    // ✅ تنظيف البيانات
                    await RoomParticipant.deleteOne({ _id: participant._id });

laith, [25/10/2025 06:09 م]
if (room) {
                        room.currentParticipants = Math.max(0, room.currentParticipants - 1);
                        await room.save();
                    }

                    // ✅ تنظيف البيانات المؤقتة
                    const roomData = activeRooms.get(currentRoom);
                    if (roomData) {
                        roomData.participants.delete(userId);
                        if (hadVoiceAccess) {
                            roomData.voiceParticipants.delete(userId);
                        }
                    }

                    userSockets.delete(userId);

                    // 📢 إعلام المستخدمين الآخرين
                    if (hadVoiceAccess) {
                        io.to(currentRoom).emit('user-left-voice', {
                            userId: userId,
                            username: username,
                            voiceSeatNumber: voiceSeatNumber
                        });
                    }

                    io.to(currentRoom).emit('user-left-room', {
                        userId: userId,
                        username: username,
                        reason: 'disconnected'
                    });

                    console.log(✅ [${socket.id}] تم تنظيف بيانات ${username});
                }
            }

        } catch (error) {
            console.error(❌ [${socket.id}] خطأ في تنظيف البيانات:, error);
        }
    });

    // =============================================
    // 10. 🏓 فحص الاتصال (Ping/Pong)
    // =============================================
    socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
    });

// });

// =============================================
// 🚀 تشغيل السيرفر
// =============================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(🎯 السيرفر يعمل على المنفذ ${PORT});
    console.log(📊 عدد الاتصالات النشطة: ${io.engine.clientsCount});
});