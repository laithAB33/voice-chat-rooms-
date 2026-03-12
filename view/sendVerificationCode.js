
let sendVerificationCode = (verificationCode)=>
`
<div style="font-family: Arial, sans-serif;">
<h2 style="color: #4285f4;">account verification</h2>
<p>the verification code for the account 
<br>
<div style="
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 5px;
    font-family: 'Courier New', monospace;
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 8px;
    text-align: center;
    margin: 20px 0;
    ">
${verificationCode}
</div>
<br>
</p>
<p>the code expire in 10 m</p>
</div>`

export {sendVerificationCode};