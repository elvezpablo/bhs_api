import { Client } from "@neondatabase/serverless";
import { Hono } from "hono";
import { cors } from 'hono/cors'
import { cache } from 'hono/cache'
import { poweredBy } from "hono/powered-by";
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// These initial Types are based on bindings that don't exist in the project yet,
// you can follow the links to learn how to implement them.

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	MY_BUCKET: R2Bucket;
	DATABASE_URL: string;
}

const app = new Hono();
app.get('*', cache({ cacheName: 'busd_worker', cacheControl: 'max-age=3600' }))

app.use(
	'/v1/*',
	cors({
	  origin: "*",
	  allowMethods: ['GET', 'OPTIONS'],
	})
  )

app.use("*", poweredBy());

const v1 = new Hono();
v1.get("/", async (c) => {	
	const client = new Client(c.env.DATABASE_URL);
	await client.connect();
	const { rows } = await client.query("SELECT count(*) from data");
	await client.end();
	
	return c.json(rows[0]);
});

v1.get("/sensors", async (ctx) => {
	const client = new Client(ctx.env.DATABASE_URL);
	await client.connect();
	const { rows } = await client.query("SELECT * from sensors");
	await client.end();
	
	return ctx.json(rows);
})

v1.get("/buildings", async (ctx) => {
	const client = new Client(ctx.env.DATABASE_URL);
	await client.connect();
	const { rows } = await client.query("SELECT DISTINCT building from sensors ORDER BY building");
	await client.end();
	
	return ctx.json(rows.map(r => r.building));
})

v1.get("/building/:building/sensors", async (ctx) => {
	const client = new Client(ctx.env.DATABASE_URL);
	await client.connect();
	const { rows } = await client.query("SELECT * from sensors WHERE upper(building) LIKE $1 ORDER BY room", [ctx.req.param('building').toUpperCase()]);
	await client.end();
	
	return ctx.json(rows);
})

v1.get("/sensor/:mac", async (ctx) => {
	const client = new Client(ctx.env.DATABASE_URL);
	await client.connect();
	const { rows } = await client.query("SELECT * from sensors WHERE mac = $1 ORDER BY room", [ctx.req.param('mac')]);
	await client.end();
	
	return ctx.json(rows);
})
v1.get('/sensor/:mac/data', async (ctx) => {
	const client = new Client(ctx.env.DATABASE_URL);
	await client.connect();	
	const range = ctx.req.query('range');
	let rangeQuery = "";
	if(range && range.length >= 13) {
		const [start, end] = range.split("-");
		if(tsRegex.test(start)) {
			rangeQuery += ` AND timestamp > ${start} `;

		}
		if(end && tsRegex.test(start) && tsRegex.test(end)) {
			rangeQuery += ` AND timestamp < ${end} `;
		}
	}
	
	const query = `SELECT * from data WHERE mac = $1 ${rangeQuery} ORDER BY timestamp DESC LIMIT 500`;	
	const { rows } = await client.query(query, [ctx.req.param('mac')]);
	await client.end();
	
	return ctx.json(rows);
})

const tsRegex = new RegExp(/[0-9]{13}/)

v1.get('/sensor/:mac/data/:type', async (ctx) => {
	const client = new Client(ctx.env.DATABASE_URL);
	await client.connect();
	const type = ctx.req.param('type');
	const range = ctx.req.query('range');
	let rangeQuery = "";
	if(range && range.length >= 13) {
		const [start, end] = range.split("-");
		if(tsRegex.test(start)) {
			rangeQuery += ` AND timestamp > ${start} `;

		}
		if(end && tsRegex.test(start) && tsRegex.test(end)) {
			rangeQuery += ` AND timestamp < ${end} `;
		}
	}
	const typeQuery = type ?  ` AND type = ${type} ` : "";
	const query = `SELECT * from data WHERE mac = $1 ${typeQuery} ${rangeQuery} ORDER BY timestamp DESC LIMIT 500`;	
	console.log(query)
	const { rows } = await client.query(query, [ctx.req.param('mac')]);
	await client.end();
	
	return ctx.json(rows);
})

app.route('/v1', v1)

export default app;