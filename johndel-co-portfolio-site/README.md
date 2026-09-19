# Johndel M. Co — Portfolio

Static site. No build step, no dependencies.

## Files

```
index.html      markup
styles.css      all styling
main.js         nav, reveals, scroll behaviour
assets/         images + resume
README.md
```

## Add your resume

The **Download Resume** button points to:

```
assets/johndel-co-resume.pdf
```

Drop your PDF in `assets/` with exactly that filename and the button works.
Until it's there, the button shows a short note instead of opening a broken link.
(To use a different filename, change the `href` on the Download Resume link in `index.html`.)

## Publish on GitHub Pages

1. Create a repo and push these files to the root of the `main` branch.
2. Repo **Settings → Pages → Source:** Deploy from a branch → `main` / `(root)`.
3. Your site goes live at `https://<username>.github.io/<repo>/`.

## Editing content

All text lives in `index.html`. Colours, type scale and spacing are CSS
custom properties at the top of `styles.css` (`:root`).
