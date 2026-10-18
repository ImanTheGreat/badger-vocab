# Badger Vocab

Private, offline vocabulary practice in 48 languages, plus Free Learn: your own flashcard decks on any subject, with pictures. Practice with matching, flashcards and lists.

**Made by Iman Lloyd as a gift to the University of Wisconsin-Madison Language Department.**

*Badger Vocab is an independent project and is not affiliated with or endorsed by the University of Wisconsin-Madison.*

© 2026 Iman Lloyd. Shared under the [PolyForm Noncommercial License 1.0.0](LICENSE.md).

> Required Notice: Copyright (c) 2026 Iman Lloyd. Badger Vocab was made by Iman Lloyd as a gift to the University of Wisconsin-Madison Language Department.

## License in plain terms

- Students, teachers, schools and universities may use, copy and share Badger Vocab for free, for any noncommercial purpose.
- You may change it, but anyone who shares a copy, changed or not, must include the license and the Required Notice above. That keeps the credit attached to the work.
- It may not be sold or used commercially without Iman Lloyd's permission.

This summary is only a guide. [LICENSE.md](LICENSE.md) has the full terms.

## Two ways to use it

**1. The single file (easiest to share).**
`dist/Badger Vocab.html` is the whole app in one file. Send it by email, AirDrop, Teams or a USB stick.
The person opens it in any browser (Chrome, Safari, Edge, Firefox) on a laptop, tablet or phone. No internet,
no account, no install. Each person's words and progress are stored only in their own browser.

**2. As an installable web app (best on phones).**
Put this whole folder on any free static host, such as GitHub Pages, Netlify Drop or a UW web space.
People visit the link once, then choose "Add to Home Screen" (iPhone/Android) or "Install" (Chrome/Edge).
It then opens like a normal app with its own icon and works with no internet.
Each person's data still stays on their own device. Nothing is uploaded, and nobody can see anyone else's words.

## Two builds: with and without the Arabic word list

Running `python3 build.py` makes two files in `dist/`:

| File | Includes Arabic list | Use it for |
|---|---|---|
| `Badger Vocab.html` | Yes, 5,308 words | Your own use, and sharing privately with the department |
| `Badger Vocab (no word list).html` | No | Posting publicly, e.g. on GitHub |

The Arabic list (`data/arabic-words.js`) may come from a published source, so it isn't covered by
Badger Vocab's license. `.gitignore` keeps it, and the full build, off GitHub automatically.
The app works without it: Arabic simply starts empty, like every other language.
Only remove it from `.gitignore` if you've confirmed you have the rights to publish it.

## Posting on GitHub

1. Make a new repository on github.com (public or private).
2. Upload this folder's contents. With the GitHub Desktop app or `git`, `.gitignore` leaves out the word list for you.
   If you upload through the website instead, don't drag in `data/arabic-words.js` or `dist/Badger Vocab.html`.
3. Optional: turn on **Settings → Pages** to get a free link people can install the app from.
   (Without the word list file, the hosted copy starts with no built-in Arabic words.)

Your commit history is date-stamped under your account, which records that you published it first.

## Privacy

Nothing you type is sent anywhere. The one exception is "Read aloud" with the Google voice:
when you're online, the single word being spoken is sent to Google Translate to get the audio.
Choose "Device voice only" in settings to keep everything on the device.

## Files

| File | What it is |
|---|---|
| `index.html` | The page layout (home, groups, practice and About screens, header and footer) |
| `style.css` | All colors and styling. The color palette is at the top |
| `app.js` | All app logic. There's a map of the file at the top |
| `free.js` | The start menu and Free Learn (your own decks, with pictures) |
| `break.js` | Study Break: Sudoku (generator, pen and pencil, scoring) and chess puzzles (rules engine, Elo rating) |
| `data/chess-puzzles.js` | 999 rated puzzles from the Lichess open puzzle database (public domain, CC0) |
| `data/arabic-words.js` | The built-in Arabic frequency list (private; see above) |
| `manifest.webmanifest`, `sw.js`, `icons/` | Make it installable and work offline when hosted |
| `build.py` | Bundles everything into the single files in `dist/` |
| `themes.py` | Generates the color themes and checks they are readable |
| `LICENSE.md` | The full license terms |

## Changing things

1. Edit the files (any text editor works; VS Code is a good free one).
2. To try it, open `index.html` in a browser.
3. Rebuild the shareable single files with `python3 build.py`.
4. If it's hosted, upload the changed files and bump `VERSION` in `sw.js` so devices pick up the new copy.

Common edits:
- **Colors and themes:** all 22 themes are listed in `themes.py`. To add one, add a line with a name and a color (hue and saturation), then run `python3 themes.py` followed by `python3 build.py`. The script builds the light and dark versions and checks that all text stays readable.
- **Add a built-in language:** add a line to `LANGS` in `app.js`.
- **Footer text:** the `<footer>` line near the bottom of `index.html`.
- **About screen:** the `vAbout` section in `index.html`.

## Backups

Progress lives in the browser, so clearing browser data erases it. Use **Backup → Export backup** on the
home screen to save a `.json` file, and **Import backup** to restore it or move it to another device.

## Credits

Chess puzzles are a sample of the [Lichess open puzzle database](https://database.lichess.org/), released by Lichess into the public domain (CC0).
