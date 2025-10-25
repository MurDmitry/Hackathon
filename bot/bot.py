import os
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
import asyncio
from dotenv import load_dotenv

# Переменные из .env файла
load_dotenv()

# Токен из переменных окружения
BOT_TOKEN = os.getenv('BOT_TOKEN')
WEB_APP_URL = os.getenv('WEB_APP_URL')

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def send_welcome(message: types.Message):
    await message.answer(
        "Привет!\n\n" \
        "Mini App доступен по кнопке меню"
    )

async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())