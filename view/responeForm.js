function sendSuccessResponse(res, user,) {
    const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
    };

   let html = `

   <!DOCTYPE html>
   <html lang="ar" dir="rtl">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>تمت المصادقة بنجاح | Authentication Successful</title>
       <style>
           * {
               margin: 0;
               padding: 0;
               box-sizing: border-box;
           }
   
           :root {
               --primary: #667eea;
               --success: #10b981;
               --error: #ef4444;
               --text: #1f2937;
               --bg: #f8fafc;
           }
   
           body {
               font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
               min-height: 100vh;
               display: flex;
               justify-content: center;
               align-items: center;
               padding: 20px;
               line-height: 1.6;
           }
   
           .container {
               background: white;
               border-radius: 20px;
               box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
               padding: 40px;
               max-width: 500px;
               width: 100%;
               text-align: center;
               animation: slideUp 0.5s ease-out;
           }
   
           @keyframes slideUp {
               from {
                   opacity: 0;
                   transform: translateY(30px);
               }
               to {
                   opacity: 1;
                   transform: translateY(0);
               }
           }
   
           .success-icon {
               width: 80px;
               height: 80px;
               background: var(--success);
               border-radius: 50%;
               display: flex;
               align-items: center;
               justify-content: center;
               margin: 0 auto 20px;
               animation: bounce 1s ease-in-out;
           }
   
           .success-icon svg {
               width: 40px;
               height: 40px;
               color: white;
           }
   
           @keyframes bounce {
               0%, 20%, 50%, 80%, 100% {
                   transform: translateY(0);
               }
               40% {
                   transform: translateY(-10px);
               }
               60% {
                   transform: translateY(-5px);
               }
           }
   
           h1 {
               color: var(--text);
               margin-bottom: 10px;
               font-size: 28px;
               font-weight: 700;
           }
   
           .subtitle {
               color: #6b7280;
               margin-bottom: 30px;
               font-size: 16px;
           }
   
           .user-info {
               background: #f8fafc;
               border-radius: 12px;
               padding: 20px;
               margin: 25px 0;
               text-align: right;
               border: 1px solid #e5e7eb;
           }
   
           .user-avatar {
               width: 60px;
               height: 60px;
               border-radius: 50%;
               margin: 0 auto 15px;
               border: 3px solid var(--success);
           }
   
           .user-name {
               font-size: 18px;
               font-weight: 600;
               color: var(--text);
               margin-bottom: 5px;
           }
   
           .user-email {
               color: #6b7280;
               font-size: 14px;
           }
   
           .status-container {
               background: #f0f9ff;
               border-radius: 12px;
               padding: 20px;
               margin: 25px 0;
               border: 1px solid #bae6fd;
           }
   
           .status-item {
               display: flex;
               justify-content: space-between;
               align-items: center;
               margin-bottom: 15px;
           }
   
           .status-item:last-child {
               margin-bottom: 0;
           }
   
           .status-label {
               font-size: 14px;
               color: #6b7280;
           }
   
           .status-value {
               font-size: 14px;
               font-weight: 600;
               color: var(--text);
           }
   
           .status-value.success {
               color: var(--success);
           }
   
           .progress-container {
               margin: 30px 0;
           }
   
   .progress-bar {
               height: 6px;
               background: #e5e7eb;
               border-radius: 3px;
               overflow: hidden;
               margin-bottom: 10px;
           }
   
           .progress-fill {
               height: 100%;
               background: linear-gradient(90deg, var(--success), #34d399);
               border-radius: 3px;
               animation: progress 3s ease-in-out;
           }
   
           @keyframes progress {
               from { width: 0%; }
               to { width: 100%; }
           }
   
           .progress-text {
               font-size: 14px;
               color: #6b7280;
               display: flex;
               justify-content: space-between;
           }
   
           .countdown {
               font-size: 14px;
               color: #6b7280;
               margin: 20px 0;
           }
   
           .countdown-number {
               font-weight: 600;
               color: var(--primary);
           }
   
           .info-box {
               background: #fef3c7;
               border: 1px solid #f59e0b;
               border-radius: 10px;
               padding: 15px;
               margin: 20px 0;
               text-align: right;
           }
   
           .info-title {
               font-size: 14px;
               font-weight: 600;
               color: #92400e;
               margin-bottom: 8px;
               display: flex;
               align-items: center;
               gap: 8px;
           }
   
           .info-text {
               font-size: 13px;
               color: #92400e;
               line-height: 1.5;
           }
   
           .btn {
               padding: 12px 30px;
               border: none;
               border-radius: 10px;
               font-size: 16px;
               font-weight: 600;
               cursor: pointer;
               transition: all 0.3s ease;
               display: inline-flex;
               align-items: center;
               justify-content: center;
               gap: 8px;
               background: var(--primary);
               color: white;
               margin-top: 10px;
           }
   
           .btn:hover {
               background: #5a6fd8;
               transform: translateY(-2px);
           }
   
           .loading-dots {
               display: inline-flex;
               gap: 4px;
               margin-left: 10px;
           }
   
           .loading-dots span {
               width: 6px;
               height: 6px;
               border-radius: 50%;
               background: var(--success);
               animation: pulse 1.5s ease-in-out infinite;
           }
   
           .loading-dots span:nth-child(2) {
               animation-delay: 0.2s;
           }
   
           .loading-dots span:nth-child(3) {
               animation-delay: 0.4s;
           }
   
           @keyframes pulse {
               0%, 100% { opacity: 0.4; transform: scale(0.8); }
               50% { opacity: 1; transform: scale(1.2); }
           }
   
           @media (max-width: 480px) {
               .container {
                   padding: 25px 20px;
                   margin: 10px;
               }
               
               h1 {
                   font-size: 24px;
               }
           }
       </style>
   </head>
   <body>
       <div class="container">
           <div class="success-icon">
               <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
               </svg>
           </div>
   
           <h1>!تمت المصادقة بنجاح</h1>
           <p class="subtitle">Authentication Completed Successfully</p>
   
           <div class="user-info">
               <img id="userAvatar" class="user-avatar" src="" alt="User Avatar" onerror="this.style.display='none'">
               <div class="user-name" id="userName"></div>
               <div class="user-email" id="userEmail"></div>
           </div>
   
           <div class="status-container">
               <div class="status-item">
                   <span class="status-label">حالة المصادقة:</span>
                   <span class="status-value success">✅ ناجحة</span>

   </div>
               <div class="status-item">
                   <span class="status-label">وقت المصادقة:</span>
                   <span class="status-value" id="authTime"></span>
               </div>
               <div class="status-item">
                   <span class="status-label">جلسة فعالة حتى:</span>
                   <span class="status-value" id="expiryTime"></span>
               </div>
           </div>
   
           <div class="progress-container">
               <div class="progress-bar">
                   <div class="progress-fill"></div>
               </div>
               <div class="progress-text">
                   <span>جاري إعادة التوجيه إلى التطبيق</span>
                   <span id="progressText">0%</span>
               </div>
           </div>
   
           <div class="countdown">
               سيتم إعادة التوجيه تلقائياً خلال <span class="countdown-number" id="countdown">5</span> ثانية
           </div>
   
           <div class="info-box">
               <div class="info-title">
                   <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                       <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                   </svg>
                   معلومات مهمة
               </div>
               <div class="info-text">
                   • تم تخزين بيانات المصادقة بشكل آمن في خوادمنا<br>
                   • سيتم إرسال البيانات إلى التطبيق عبر قناة آمنة<br>
                   • يمكنك إغلاق هذه النافذة بأمان
               </div>
           </div>
   
           <button class="btn" onclick="closeWindowNow()">
               <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                   <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
               </svg>
               إغلاق النافذة الآن
           </button>
       </div>
   
       <script>
           // 📊 تحديث واجهة المستخدم بالمعلومات
           function updateUI() {
               // تعبئة بيانات المستخدم
               document.getElementById('userName').textContent = '{{USER_NAME}}';
               document.getElementById('userEmail').textContent = '{{USER_EMAIL}}';
               
               const userAvatar = document.getElementById('userAvatar');
               if ('{{USER_PICTURE}}' && '{{USER_PICTURE}}' !== '{{USER_PICTURE}}') {
                   userAvatar.src = '{{USER_PICTURE}}';
               }
   
               // تحديث الوقت
               const now = new Date();
               document.getElementById('authTime').textContent = now.toLocaleTimeString('ar-SA');
               
               const expiry = new Date(now.getTime() + 60 * 60 * 1000); // ساعة من الآن
               document.getElementById('expiryTime').textContent = expiry.toLocaleTimeString('ar-SA');
           }
   
           // 🔄 تحديث شريط التقدم والعد التنازلي
           function startCountdown() {
               let countdown = 5;
               let progress = 0;
               
               const countdownElement = document.getElementById('countdown');
               const progressText = document.getElementById('progressText');
               
               const interval = setInterval(() => {
                   countdown--;
                   progress += 20;
                   
                   countdownElement.textContent = countdown;
                   progressText.textContent = progress + '%';
                   
                   if (countdown <= 0) {
                       clearInterval(interval);
                       closeWindow();
                   }
               }, 1000);
           }
   
           // 🚪 إغلاق النافذة
           function closeWindow() {
   console.log('🔄 إعادة التوجيه إلى التطبيق...');
               
               // محاولة إغلاق النافذة
               if (window.opener) {
                   window.close();
               } else {
                   // إذا لم تكن نافذة منبثقة، عرض رسالة
                   document.body.innerHTML = 
                       
                       <div class='containe'>
                           <div class="success-icon">✅</div>
                           <h1>تمت العملية!</h1>
                           <p class="subtitle">يمكنك إغلاق هذه النافذة بأمان</p>
                           <button class="btn" onclick="window.close()">إغلاق النافذة</button>
                       </div>
                       
                   ;
               }
           }
   
           // 🚪 إغلاق فوري
           function closeWindowNow() {
               window.close();
           }
   
           // 🎯 بدء التشغيل عند تحميل الصفحة
           document.addEventListener('DOMContentLoaded', function() {
               updateUI();
               startCountdown();
               
               // تسجيل للمتابعة
               console.log('✅ صفحة نجاح المصادقة محملة');
               console.log('👤 المستخدم: {{USER_EMAIL}}');
               console.log('⏰ وقت المصادقة: ' + new Date().toISOString());
           });
       </script>
   </body>
   </html>
   `;
    
    res.send(html);
}

function sendErrorResponse(res, errorMessage) {

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>فشل المصادقة</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 50px;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                color: white;
            }
            .error-icon {
                font-size: 80px;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="error-icon">❌</div>
        <h2>فشل في المصادقة</h2>
        <p>${errorMessage}</p>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; margin: 10px;">إغلاق</button>
    
        <script>
            // إرسال بيانات الخطأ لـ Flutter
            const errorData = {
                success: false,
                error: "${errorMessage}"
            };
    
            // محاولة إرسال الخطأ
            if (window.flutter_inappwebview) {
                window.flutter_inappwebview.callHandler('authHandler', errorData);
            } else if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify(errorData));
            }
    
            setTimeout(() => {
                window.close();
            }, 3000);
        </script>
    </body>
    </html>`;
        
        res.send(html);
    }

export {sendSuccessResponse,sendErrorResponse}