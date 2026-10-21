import { describe, it } from 'node:test'
import { RuleTester } from 'oxlint/plugins-dev'

import { preferLoggerErrKeyRule } from './prefer-logger-err-key.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })
const service = 'import logger from "@adonisjs/core/services/logger";\n'
const errors = [{ messageId: 'useErrKey' }]

tester.run('prefer-logger-err-key', preferLoggerErrKeyRule, {
  valid: [
    service + 'logger.error({ err: new Error("failed"), jobId: 42 }, "Failed")',
    service + 'try {} catch (error) { logger.error({ err: error }, "Failed") }',
    service + 'logger.error(new Error("failed"))',
    service + 'try {} catch (error) { logger.error(error, "Failed") }',
    service + 'logger.error({ error: "failed", code: 500 })',
    service + 'try {} catch (error) { logger.error({ error: error.message }) }',
    service + 'logger.error("Failed: %o", { error: new Error() })',
    service + 'logger.child({ error: new Error() })',
    service + 'logger.error({ nested: { error: new Error() } })',
    service + 'logger.error({ [key]: new Error() })',
    service + 'logger.error({ ["err"]: new Error() })',
    'console.error({ error: new Error() })',
    'const logger = customLogger(); logger.error({ error: new Error() })',
    'import logger from "another-logger"; logger.error({ error: new Error() })',
    service + 'function run(logger) { logger.error({ error: new Error() }) }',
    service + 'try {} catch (error) { function run(error: string) { logger.error({ error }) } }',
    service + 'try {} catch (error) { error = "text"; logger.error({ error }) }',
    service + 'function run(Error) { logger.error({ error: new Error() }) }',
    'import pino from "pino"; function run(pino) { const log = pino(); log.error({ error: new Error() }) }',
    'import pino from "pino"; let log = pino(); log = customLogger(); log.error({ error: new Error() })',
    service + 'const a = b; const b = a; logger.error({ error: a })',
    service +
      'class Action { log = logger; run() { function inner() { this.log.error({ error: new Error() }) } } }',
    service +
      'class Action { log = logger; static run() { this.log.error({ error: new Error() }) } }',
    service +
      'class Action { log = logger; static run = () => this.log.error({ error: new Error() }) }',
    service +
      'class Action { log = logger; run() { class Inner { run() { this.log.error({ error: new Error() }) } } } }',
    'import type { Logger } from "another-logger"; function run(log: Logger) { log.error({ error: new Error() }) }',
  ],
  invalid: [
    {
      name: 'recognizes built-in errors declared in the environment globals',
      code: service + 'logger.error({ error: new Error() })',
      languageOptions: { globals: { Error: 'readonly' } },
      errors,
    },
    {
      name: 'reports a caught value under the wrong key',
      code: service + 'try {} catch (error) { logger.error({ error, jobId: 42 }, "Failed") }',
      errors,
    },
    {
      name: 'does not depend on the catch variable or property name',
      code: service + 'try {} catch (cause) { logger.warn({ exception: cause }) }',
      errors,
    },
    {
      name: 'reports each error property even if err is already present',
      code:
        service + 'logger.error({ err: new Error(), error: new Error(), cause: new TypeError() })',
      errors: [errors[0]!, errors[0]!],
    },
    ...['trace', 'debug', 'info', 'warn', 'error', 'fatal'].map(method => ({
      name: `checks the ${method} level`,
      code: service + `logger.${method}({ error: new Error() })`,
      errors,
    })),
    {
      name: 'handles static computed keys and optional calls',
      code: service + 'logger?.["error"]?.({ ["error"]: new Error() })',
      errors,
    },
    {
      name: 'tracks Pino factories, child loggers, and error aliases',
      code: 'import pino from "pino"; const root = pino(); const child = root.child({ job: 42 }); const log = child; const failure = new Error(); const alias = failure; log.warn({ failure: alias })',
      errors,
    },
    {
      name: 'recognizes renamed Pino factory imports',
      code: 'import { pino as makeLogger } from "pino"; makeLogger().error({ error: new Error() })',
      errors,
    },
    {
      name: 'recognizes a renamed Adonis service import',
      code: 'import log from "@adonisjs/core/services/logger"; log.error({ error: new Error() })',
      errors,
    },
    {
      name: 'recognizes typed logger and error parameters',
      code: 'import type { Logger as PinoLogger } from "pino"; function report(log: PinoLogger, failure: Error) { log.error({ failure }) }',
      errors,
    },
    {
      name: 'recognizes injected Adonis logger parameter properties',
      code: 'import { Logger } from "@adonisjs/core/logger"; class Action { constructor(protected logger: Logger) {} run() { try {} catch (error) { this.logger.error({ error }) } } }',
      errors,
    },
    {
      name: 'recognizes typed private logger fields',
      code: 'import type { Logger } from "@adonisjs/logger"; class Action { #log: Logger; run() { this.#log.error({ error: new Error() }) } }',
      errors,
    },
    {
      name: 'recognizes logger field initializers inside arrow callbacks',
      code:
        service +
        'class Action { log = logger; run() { return () => this.log.error({ error: new Error() }) } }',
      errors,
    },
    {
      name: 'recognizes constructed Adonis loggers',
      code: 'import { Logger } from "@adonisjs/logger"; const log = new Logger({ name: "app" }); log.error({ error: new Error() })',
      errors,
    },
    {
      name: 'tracks catch bindings through type assertions',
      code: service + 'try {} catch (error) { logger.error({ cause: error as Error }) }',
      errors,
    },
  ],
})
