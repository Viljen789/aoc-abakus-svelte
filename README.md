# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

Local dev: 
```ssh
python manage.py shell:
  
 from lego.apps.oauth.models import APIApplication
 
 # Get the existing app
 app = APIApplication.objects.get(client_id="sC6GkHr8GS2OSRpFzKL2aASnz2eTPLYqK8TAGihF")
 
 # Add your redirect URI (keeping the original one too)
 app.redirect_uris = """http://127.0.0.1:5000/complete/lego/
 http://localhost:5173/auth/callback"""
 
 app.save()
 
 print("done")
```