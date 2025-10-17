from rivescript import RiveScript

# ایجاد بات
bot = RiveScript()  # utf8 حذف شد، charset از فایل .rive میاد
bot.load_file("./bot/bot.rive")
bot.sort_replies()

user = "localuser"

print("Bot آماده است! برای خروج /quit یا q یا e را وارد کنید.")

while True:
    msg = input("You> ").strip()
    if msg.lower() in ("/quit", "q", "e"):
        print("good bye")
        break

    reply = bot.reply(user, msg)
    print("Bot>", reply)
