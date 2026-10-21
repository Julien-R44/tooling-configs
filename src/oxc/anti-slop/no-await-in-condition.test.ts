import { describe, it } from 'node:test'
import { RuleTester } from 'oxlint/plugins-dev'

import { noAwaitInConditionRule } from './no-await-in-condition.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })
const errors = [{ messageId: 'extractAwait' }]

tester.run('no-await-in-condition', noAwaitInConditionRule, {
  valid: [
    'const ready = await check(); if (ready) run()',
    'if (ready) await run()',
    'if (ready) { await run() } else { await fallback() }',
    'if (ready) { if (enabled) { await run() } }',
    'if (check(async () => await load())) run()',
    'if (check(async function () { return await load() })) run()',
    'if (check(class { async load() { return await fetch(url) } })) run()',
    'while (await check()) run(); const value = (await check()) ? first : second',
  ],
  invalid: [
    ...[
      'if (await check()) run()',
      'if (!(await check())) run()',
      'if (ready && await check()) run()',
      'if (ready || await check()) run()',
      'if (ready) run(); else if (await check()) fallback()',
      'if (check(await load())) run()',
      'if (((await load()) as Result).ready) run()',
      'if (ready ? await first() : fallback) run()',
      'if (check(async () => { if (await load()) run() })) run()',
    ].map(code => ({ code, errors, output: null })),
    {
      name: 'reports each await in the condition but not in the body',
      code: 'if (await first() && await second()) { await run() }',
      errors: [errors[0]!, errors[0]!],
      output: null,
    },
  ],
})
