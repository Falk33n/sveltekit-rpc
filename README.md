# SvelteKit RPC

This is a simple and type-safe [Remote Procedure Call (`RPC`)](https://www.techtarget.com/searchapparchitecture/definition/Remote-Procedure-Call-RPC) implementation in a [`SvelteKit`](https://svelte.dev/docs/kit/introduction) project.  
It demonstrates how to call server-side functions _directly_ and _typesafely_ from the client using a minimal setup.

---

## 📚 Table of Contents

- [🧠 How It Works](#-how-it-works)
- [🚀 Getting Started](#-getting-started)
    - [1. Clone the repository](#1-clone-the-repository)
    - [2. Install dependencies](#2-install-dependencies)
    - [3. Start the dev server](#3-start-the-dev-server)
- [🛠️ How To Use](#-how-to-use)
    - [1. Define the routes](#1-define-the-routes)
    - [2. Create the app router](#2-create-the-app-router)
    - [3. Calling the API](#3-calling-the-api)
    - [4. Creating an middleware](#4-creating-an-middleware)
- [📃 License](#license)
- [🐛 Found a Bug?](#-found-a-bug)

---

## 🧠 How It Works

Server-side functions are defined in [`$lib/server/routers/*.ts`](./src/lib/server/routers) and combined inside the [`appRouter`](./src/lib/server/root.ts) in [`$lib/server/root.ts`](./src/lib/server/root.ts).

The [`/api/[...endpoints]`](./src/routes/api/[...endpoints]/+server.ts) route catches [`RPC`](https://www.techtarget.com/searchapparchitecture/definition/Remote-Procedure-Call-RPC) requests and runs the matching function using the [`callRouter`](./src/lib/server/caller.ts) function in [`$lib/server/caller.ts`](./src/lib/server/caller.ts).

The client makes a fetch call to that route using the [`callApi`](./src/lib/client/caller.ts) function in [`$lib/client/caller.ts`](./src/lib/client/caller.ts). Which provides full type safety and [`IntelliSense`](https://code.visualstudio.com/docs/editing/intellisense) for the defined route.

[`Zod`](https://zod.dev/?id=introduction) is used to make validations of the input before the actual function runs but also validates the output before it reaches its end destination. This functionality is wrapped inside the base middleware [`publicProcedure`](./src/lib/server/setup.ts) in [`$lib/server/setup.ts`](./src/lib/server/setup.ts).

[`TypeScript`](https://www.typescriptlang.org/docs/) ensures type safety for arguments and return values but also [`IntelliSense`](https://code.visualstudio.com/docs/editing/intellisense) for the developer.

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Falk33n/sveltekit-rpc.git
cd sveltekit-rpc
```

### 2. Install dependencies

```bash
# (or use `bun install` / `pnpm install` / `yarn install` if you prefer).
npm install
```

### 3. Start the dev server

```bash
# (or use `bun run dev` / `pnpm run dev` / `yarn run dev` if you prefer).
npm run dev
```

Your app should now be running at [http://localhost:5173](http://localhost:5173).

## 🛠️ How To Use

### 1. Define the routes

```ts
import { exampleInputSchema, exampleOutputSchema } from '$lib/schemas/example';
import { createRouter, publicProcedure } from '../setup';

export const exampleRouter = createRouter({
	example: {
		method: 'post',
		handler: publicProcedure
			.input(exampleInputSchema)
			.output(exampleOutputSchema)
			.resolve(async (event, input) => {
				// The input is directly parsed from the input schema.
				const { id } = input;

				// The event is the same as the event that comes from SvelteKit backend.
				console.log(event.params);

				// The output is directly parsed from the output schema.
				return {
					status: 200,
					data: { id, name: 'hanna' },
					message: 'OK',
				};
			}),
	},
});
```

### 2. Create the app router

```ts
import { exampleRouter } from './routers';
import { createAppRouter } from './setup';

// This is the root of all the endpoints, we define this to get a better structure of different
// categories of routers.
export const appRouter = createAppRouter({
	example: exampleRouter,
});
```

### 3. Calling the API

```svelte
<script lang="ts">
	import { callApi } from '../lib/client/caller';

	async function onclick() {
		// Fully typesafe api caller, that will give you the correct input,
		// output and method based on the endpoint string.
		const api = await callApi('example.example', {
			input: { id: 'hoho' },
			method: 'post',
		});

		// Logs the return object of the api.
		console.log(api);
	}
</script>

<button {onclick}>test</button>
```

### 4. Creating an middleware

```ts
import { publicProcedure } from '../setup';

// This is how we define an middleware to be used and called inbefore each endpoint runs.
const exampleProcedure = publicProcedure.use((event) => console.log(event.cookies.getAll()));
```

## License

Distributed under the [`MIT` License](https://memgraph.com/blog/what-is-mit-license). This project is open source and free to use, modify, and distribute under the terms of the [`MIT` License](https://memgraph.com/blog/what-is-mit-license).

You can find the full license text in the [`LICENSE.md`](./LICENSE.md) file.

## 🐛 Found a Bug?

Open an issue or create a pull request. Contributions are always welcome!

If you discover a **security vulnerability**, please **do not** open an issue or create a pull request.
Instead, report it **privately** by emailing [**tim.falk00@gmail.com**](mailto:tim.falk00@gmail.com) _or_ [**nils-pettsson@outlook.com**](mailto:nils-pettsson@outlook.com). Thank you for being responsible!
