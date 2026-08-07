FOR ZAHA — Birthday Website
============================

HOW TO USE
----------
1. Add her photo and your memory photos to this same folder, named exactly:
     zaha.jpg
     me1.jpg  me2.jpg  me3.jpg  me4.jpg  me5.jpg  me6.jpg  me7.jpg

2. (Optional but recommended) Add sound files into assets/audio/, named exactly:
     birthday-music.mp3   - soft background music, loops quietly
     magic-chime.mp3      - plays when she taps "Begin"
     heartbeat.mp3         - soft, plays during memory/emotional moments
     cake-pop.mp3          - plays when the cake appears
     candle-blow.mp3       - plays when she makes her wish
     sparkle.mp3           - plays on reveals/transitions
     page-flip.mp3         - plays between memories
     letter-reveal.mp3     - plays when the letter opens
     final-love.mp3        - soft piano/ambient for the final screen

   The site works perfectly fine without any of these — it just stays
   silent for whichever files are missing. Nothing will break or crash.

3. Open index.html in any browser (double-click it, or drag it into
   Chrome/Safari/Firefox). That's it — no installation, no server,
   no internet connection needed. Everything runs 100% locally and
   nothing is ever uploaded anywhere.

4. To send it to her: zip this whole folder (with the images/audio
   added) and share it, or host it for free on something like
   Netlify Drop / GitHub Pages if you want her to open a link instead.

CUSTOMIZING
-----------
- The birthday date, her name, and the full letter text live near the
  top of index.html (for the date/name) and inside the LETTER_PARAGRAPHS
  array in script.js (for the letter). Both are easy to edit in any
  text editor.
- Colors and fonts are defined as CSS variables at the very top of
  style.css under :root — change those to shift the whole palette.

Made with ✨ — happy birthday to her.
