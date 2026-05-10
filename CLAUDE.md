# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

Turborepo + bun workspaces. Three workspaces:

- `apps/api` — NestJS 11 service (CQRS + EventSourcing). Entry `src/main.ts`, listens on `PORT` (default 3000).
- `apps/web` — Next.js 16 app (React 19, Tailwind v4, Radix/shadcn, TanStack Query, Zustand, Supabase SSR).
- `packages/contracts` (`@repo/contracts`) — shared oRPC + Zod contract definitions consumed by both api and web.

Path alias `@/*` → `src/*` is set in each TS workspace.

## Commands

Run from repo root unless noted. Use `bun` (lockfile is `bun.lock`).

```sh
bun install                           # install all workspaces
turbo run dev                         # dev all (or `bun dev`)
turbo run build                       # build all (`bun build` is bun's bundler — use `turbo run build`)
turbo run lint
turbo run check-types
turbo run dev --filter=api            # single workspace
turbo run dev --filter=web
```

Per-workspace (cd into the workspace):

```sh
# apps/api
bun run start:dev                     # nest watch mode
bun run test                          # jest, all *.spec.ts under src
bun run test -- path/to/file.spec.ts  # single test file
bun run test -- -t "name"             # by test name
bun run test:e2e                      # uses test/jest-e2e.json
bun run db:generate                   # drizzle-kit generate (from folder.schema.ts)
bun run db:push                       # push schema to DB
bun run db:migrate                    # run drizzle migrations

# packages/contracts
bun run build                         # tsup → dist (cjs+esm+dts)
bun run check-types
```

## Required infra

`apps/api/.env` must define `EVENTSTORE_CONNECTION_STRING`, `DATABASE_URL`, `PORT`. Local EventStoreDB:

```sh
docker compose up -d eventstore       # esdb://localhost:2113?tls=false
```

Postgres is **not** in `docker-compose.yml` — `DATABASE_URL` currently points at a hosted Neon instance via `apps/api/.env`. Provide your own when working locally.

## Architecture (api)

The api implements CQRS + Event Sourcing on top of `@nestjs/cqrs`, with EventStoreDB as the event log and Postgres (Drizzle ORM) as the read-model store. The folder domain (`src/modules/folder`) is the reference implementation — duplicate its layout for new aggregates.

Per-aggregate module layout:

```
modules/<aggregate>/
  domain/                  aggregate + domain events (extend AggregateRootBase / DomainEvent)
  application/
    commands/              *.command.ts + handlers/ (CommandHandler) + handlers/index.ts CommandHandlers[]
    queries/               *.query.ts + handlers/ (QueryHandler) + handlers/index.ts QueryHandlers[]
    sagas/                 @Saga reactive flows
  infrastructure/
    repositories/          extend EventStoreRepository<T>; defines streamName + createEmptyAggregate
    projections/           @EventsHandler that writes the read-model via Drizzle; plus Read repositories
  interface/               ORPC controller (@Implement(folderContract.x)) + DTOs
  <aggregate>.module.ts    imports CqrsModule; registers handlers/projection/saga; OnModuleInit calls registerXxxEvents(eventSerializer)
```

Write path: controller → `CommandBus` → handler builds/loads `Aggregate` via repository → `aggregate.apply(new SomeEvent(...))` → `repository.save()` serializes uncommitted events to a stream named `<aggregate>-<id>` with optimistic concurrency (`expectedRevision = aggregate.version`) → after append, `eventPublisher.mergeObjectContext(aggregate).commit()` publishes events to the in-process bus, which fans out to projections and sagas.

Read path: controller → `QueryBus` → handler queries the Postgres read model through a `*ReadRepository` (Drizzle). Do not read from the event store on the query side.

Event serialization: `EventSerializer` (in `SharedModule`, global) maps `eventType` strings → constructors. Every new domain event must be registered in the module's `OnModuleInit` (see `registerFolderEvents`); without registration, `findById` cannot rehydrate the aggregate.

Aggregate conventions:
- Extend `AggregateRootBase` (which extends `@nestjs/cqrs` `AggregateRoot<DomainEvent>`); `loadFromHistory` updates `_version` so the repo can compute `expectedRevision`.
- Mutations go through `this.apply(new Event(...))`. State changes live in `private on<EventName>(event)` handlers (NestJS CQRS auto-dispatches by class name).
- Domain events extend `DomainEvent` (sets `aggregateId`, `occurredOn`, `eventVersion`) and expose `eventType` string used as the EventStore event type.

Projections: implement `IEventHandler` for the union of an aggregate's events and write to Drizzle tables in `src/lib/database/*.schema.ts`. Schema source of truth for `drizzle-kit` is `apps/api/drizzle.config.ts` (`schema: ./src/lib/database/folder.schema.ts`); update it when adding new schemas.

Sagas: `@Saga` methods consume the event stream via `ofType(...)` and return `Observable<ICommand>`. Today `FolderSaga.folderDeleted` is a stub awaiting a File domain.

## Contracts

`@repo/contracts` defines oRPC contracts with Zod schemas (e.g. `folderContract.create`). The api uses `@orpc/nest` `@Implement(...)` decorators on controller methods; the web client should consume the same contract for end-to-end types. After editing a contract, rebuild the package (`turbo run build --filter=@repo/contracts`) so consumers pick up the new dist.

OpenAPI spec is generated at runtime from `folderContract` via `DocsController` — `GET /spec.json` and Scalar UI at `GET /docs`.

## Web app notes

- App Router under `app/`. Auth lives under `app/auth/`, browse UI under `app/browse/`, server actions in `lib/actions.ts`, Supabase clients in `lib/supabase/`.
- `proxy.ts` runs Supabase session refresh; matcher excludes static assets. (Filename is `proxy.ts`, not `middleware.ts` — Next 16 setup.)
- Providers tree (`app/providers.tsx`) supplies a `QueryClient` (30s staleTime, retry:1).