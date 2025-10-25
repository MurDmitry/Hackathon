from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import Message
import asyncio

BOT_TOKEN = "7785486827:AAGJs71Yn4I7G-XQPBcsuFJ4R9PM1GvFf_E"

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def send_welcome(message: Message):
    await message.answer(
        "Привет! Я бот с Mini App.\n\n"
        "Просто нажми на кнопку меню в левом нижнем углу, чтобы открыть приложение!"
    )

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())