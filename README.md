# 🎵 Naava

So I built this thing. It's a music website called **Naava** — clean, fast, and actually fun to use. I wanted to practice building a real-world UI with React and Tailwind, and music players felt like the perfect challenge because there's a lot of moving pieces: the player controls, the song list, the UI state... yeah, it was a good time.

You can check the live version here 👉 **[naava-eta.vercel.app](https://naava-eta.vercel.app)**

## 🛠️ What's under the hood

Nothing fancy, just a solid modern stack:

- **React 19** — the UI is all components, hooks, the usual React way of doing things
- **Vite** — because life's too short for slow dev servers
- **Tailwind CSS 4** — styling without losing your mind
- **Lucide React** — for all the little icons throughout the UI

## 🚀 Running it locally

Pretty straightforward. Clone it, install stuff, run it.

```bash
git clone https://github.com/Sumit-Kumar-Panigrahi/Naava.git
cd Naava
npm install
npm run dev
```

Open `http://localhost:5173` and you're good.

> You'll need Node.js v18 or higher. If `npm run dev` throws an error, that's probably why.

---

## 📂 How the code is organized

```
Naava/
├── public/        # Static stuff — favicon, images, etc.
├── src/           # All the actual code lives here
│   ├── components/    # Reusable pieces of UI
│   ├── pages/         # The different screens/views
│   └── App.jsx        # Where everything comes together
├── index.html
├── vite.config.js
└── package.json
```
Nothing unusual. If you've worked with a Vite + React project before, you'll feel right at home.

## 📦 Building for production

```bash
npm run build
```

This spits out a `dist/` folder with everything minified and ready to ship. I'm hosting it on Vercel — just connect your repo and it auto-deploys on every push. Zero config needed.

## 🐛 Found a bug? Have an idea?

Open an issue or just fork it and send a PR. I'm genuinely open to feedback — especially on the UI/UX side since I'm still learning what "good design" really means in practice.

## 👋 About me

I'm **Sumit Kumar Panigrahi**, a Full Stack Developer who builds things and then immediately wants to rebuild them better.

- GitHub: [@Sumit-Kumar-Panigrahi](https://github.com/Sumit-Kumar-Panigrahi)

Thanks for checking out Naava. Hope you like it as much as I liked building it. 🎧
