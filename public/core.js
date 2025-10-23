
const chat = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const themeBtn = document.getElementById("themeToggle");

// Unsplash
const api_key = 'jKoE_GBwJWZysJHOTN7x6eAi6rUYPTkNDx5n5aw5F8Y';

// تاریخچه پیام‌ها
let history = [];
history.unshift('من پیمان هستم');
history.unshift('چطوری');
history.unshift('خوبی');
history.unshift('سلام');
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
 // اگر متن شامل HTML است
 if(text.includes("<a")) {
    div.innerHTML += text.replace(/\\n/g, "<br>");
  } 
  else if(text.includes("<img")) {
    div.innerHTML += text.replace(/\\n/g, "<br>");
  }
  else {
    // متن معمولی
    text.replace(/\\n/g, "\n").split("\n").forEach((line, i, arr)=>{
      div.appendChild(document.createTextNode(line));
      if(i < arr.length - 1) div.appendChild(document.createElement("br"));
    });
  }

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

    
    if(data.vars && data.vars.name) username = data.vars.name;

    if(msg.startsWith("ترجمه ") && data.vars && data.vars.translate) {
      const word = data.vars.translate;
      translateText(word).then(translated => {
        appendMessage(translated,"bot","📙 ترجمه: " + word);
      });
    }

    if(msg.startsWith("عکس ") && data.vars && data.vars.image) {
      handleImage(data.vars.image);
    }

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



async function getImage(word) {

  const accessKey = api_key;
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(word)}&per_page=1&client_id=${accessKey}`;
  let result = "./images/no-image.png";
  
  try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
          result= data.results[0].urls.small;
      } else {
        result= "./images/no-image.png";
      }
  } catch (error) {
      console.error(error);
      result= "./images/no-image.png";

  }

  appendMessage("<img src='" + result +"' style='width:200px;'>","bot","📱 عکس: " + word);

}



    // --- تابع ترجمه ---
    async function translateText(word) {
      const isPersian = /[\u0600-\u06FF]/.test(word);
      const from = isPersian ? "fa" : "en";
      const to = isPersian ? "en" : "fa";
    
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${from}|${to}`;
      
      try {
        const res = await fetch(url);
        const data = await res.json();
        return data.responseData.translatedText || word;
      } catch(e) {
        console.error("خطا در ترجمه:", e);
        return word;
      }
    }
    
    // --- تابع دریافت عکس ---
    async function handleImage(word) {
      const isPersian = /[\u0600-\u06FF]/.test(word);
    
      let finalWord = word;
    
      if(isPersian) {
        // اگر فارسی بود، اول به انگلیسی ترجمه کن
        finalWord = await translateText(word);
      }
    
      // سپس برای دریافت عکس ارسال کن
      getImage(finalWord);
    }
    