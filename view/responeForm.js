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
    <title>تم التسجيل بنجاح</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #4285f4, #34a853);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #333;
        }
        
        .container {
            background-color: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            width: 90%;
            max-width: 500px;
            padding: 40px 30px;
            text-align: center;
            animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .success-icon {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #34a853, #4285f4);
            border-radius: 50%;
            margin: 0 auto 25px;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: scaleUp 0.5s ease-out;
        }
        
        @keyframes scaleUp {
            from { transform: scale(0); }
            to { transform: scale(1); }
        }
        
        .success-icon i {
            color: white;
            font-size: 50px;
        }
        
        h1 {
            color: #34a853;
            margin-bottom: 15px;
            font-size: 28px;
        }
        
        p {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
            font-size: 16px;
        }
        
        .google-logo {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
            direction: ltr; 
        }
        
        .google-logo span {
            font-size: 24px;
            font-weight: bold;
            margin: 0 2px;
            padding: 5px 10px;
            border-radius: 5px;
        }
        
        .G { background-color: #4285f4; color: white; }
        .o1 { background-color: #ea4335; color: white; }
        .o2 { background-color: #fbbc05; color: white; }
        .g { background-color: #4285f4; color: white; }
        .l { background-color: #34a853; color: white; }
        .e { background-color: #ea4335; color: white; }
        
        .loading-bar {
            width: 100%;
            height: 6px;
            background-color: #f0f0f0;
            border-radius: 3px;
            overflow: hidden;
            margin: 30px 0 20px;
        }
        
        .loading-progress {
            height: 100%;
            width: 0%;
            background: linear-gradient(to right, #4285f4, #34a853);
            border-radius: 3px;
            animation: loading 3s ease-in-out forwards;
        }
        
        @keyframes loading {
            0% { width: 0%; }
            100% { width: 100%; }
        }
        
        .redirect-text {
            color: #666;
            font-size: 14px;
            margin-top: 10px;
        }
        
        @media (max-width: 480px) {
            .container {
                padding: 30px 20px;
            }
            
            h1 {
                font-size: 24px;
            }
            
            p {
                font-size: 14px;
            }
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">


</head>
<body>
    <div class="container">
        <div class="success-icon">
            <i class="fas fa-check"></i>
        </div>
        
        <h1>تم التسجيل بنجاح!</h1>
        
        <p>لقد تم تسجيل الدخول إلى حسابك بنجاح باستخدام حساب Google الخاص بك.</p>
        
        <div class="google-logo">
            <span class="G">G</span>
            <span class="o1">o</span>
            <span class="o2">o</span>
            <span class="g">g</span>
            <span class="l">l</span>
            <span class="e">e</span>
        </div>
        
        <div class="loading-bar">
            <div class="loading-progress"></div>
        </div>
        
        <p class="redirect-text">يتم تحويلك إلى التطبيق...</p>
    </div>

    <script>
     
        setTimeout(function() {
          
          
            
       
            alert("سيتم الانتقال إلى التطبيق الآن.");
        }, 3500);
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
            
            const errorData = {
                success: false,
                error: "${errorMessage}"
            };
    
           
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