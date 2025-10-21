
const chat = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const themeBtn = document.getElementById("themeToggle");

// تاریخچه پیام‌ها
let history = [];
let historyIndex = -1;

// حالت دارک/لایت
let darkMode = true;
themeBtn.addEventListener("click", ()=>{
  darkMode = !darkMode;
  if(darkMode){
    document.documentElement.style.setProperty('--bg-color','#121212');
    document.documentElement.style.setProperty('--text-color','#fff');
    document.documentElement.style.setProperty('--header-bg','#1f1f1f');
    document.documentElement.style.setProperty('--input-bg','#1f1f1f');
    document.documentElement.style.setProperty('--user-bg','#2e7d32');
    document.documentElement.style.setProperty('--bot-bg','#1565c0');
    document.documentElement.style.setProperty('--system-bg','#fff');
    document.documentElement.style.setProperty('--system-text','#222');
  } else {
    document.documentElement.style.setProperty('--bg-color','#f5f5f5');
    document.documentElement.style.setProperty('--text-color','#222');
    document.documentElement.style.setProperty('--header-bg','#ddd');
    document.documentElement.style.setProperty('--input-bg','#eee');
    document.documentElement.style.setProperty('--user-bg','#43a047');
    document.documentElement.style.setProperty('--bot-bg','#1e88e5');
    document.documentElement.style.setProperty('--system-bg','#fff');
    document.documentElement.style.setProperty('--system-text','#222');
  }
});



  

// تابع اضافه کردن پیام
function appendMessage(text, cls, username=""){
  const div = document.createElement("div");
  div.className = `message ${cls}`;
  
  if(username && cls!=="system"){
    const name = document.createElement("span");
    name.className="username";
    name.textContent=username;
    div.appendChild(name);
  }

  // خطوط جدید (\n واقعی یا \\n)
  text.replace(/\\n/g, "\n").split("\n").forEach((line, i, arr)=>{
    div.appendChild(document.createTextNode(line));
    if(i < arr.length - 1) div.appendChild(document.createElement("br"));
  });

  if(cls==="system"){
    chat.appendChild(div);
  } else {
    chat.prepend(div);
  }

  setTimeout(()=>{ if(cls!=="system") div.classList.add("show"); },50);
}

// --- نگهداری نام کاربر ---
let username = "مهمان";

// ارسال پیام با هوشمندی دریافت name از سرور
async function sendMessage(){
  const msg = msgInput.value.trim();
  if(!msg) return;

  history.unshift(msg);
  historyIndex = -1;

  // پیام کاربر قبل از دریافت reply
  appendMessage(msg,"user",username);

  msgInput.value="";
  msgInput.focus();

  try{
    // ارسال به سرور (Node.js + RiveScript)
    const res = await fetch("/api/chat",{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({user:"localuser",message:msg})
    });

    const data = await res.json();

    // اگر سرور متغیر name را برگرداند، username جایگزین شود
    if(data.vars && data.vars.name) username = data.vars.name;

    if(data.vars && data.vars.theme) {
        if(darkMode && data.vars.theme=="light"){
            themeBtn.click();
        }


        if(!darkMode && data.vars.theme=="dark"){
            themeBtn.click()
        }

    }


    // پیام بات
    if(data.reply) appendMessage(data.reply,"bot","peyman-x");
    else appendMessage("پاسخی دریافت نشد.","bot","peyman-x");

  }catch{
    appendMessage("خطا در ارتباط با سرور.","bot","peyman-x");
  }
}

// کلیدهای بالا/پایین برای تاریخچه
msgInput.addEventListener("keydown", e=>{
  if(e.key==="ArrowUp"){
    e.preventDefault();
    if(history.length && historyIndex < history.length-1){
      historyIndex++;
      msgInput.value = history[historyIndex];
    }
  } else if(e.key==="ArrowDown"){
    e.preventDefault();
    if(historyIndex > 0){
      historyIndex--;
      msgInput.value = history[historyIndex];
    } else {
      historyIndex = -1;
      msgInput.value = "";
    }
  }
});

// Enter برای ارسال
msgInput.addEventListener("keypress", e=>{
  if(e.key==='Enter') sendMessage();
});