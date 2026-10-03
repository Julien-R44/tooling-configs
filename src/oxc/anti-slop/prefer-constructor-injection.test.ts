import { describe, it } from 'node:test'
import { RuleTester } from 'oxlint/plugins-dev'

import { preferConstructorInjectionRule } from './prefer-constructor-injection.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })
const errors = [{ messageId: 'preferParameterProperty' }]

tester.run('prefer-constructor-injection', preferConstructorInjectionRule, {
  valid: [
    '@inject() class Service { constructor(protected logger: Logger) {} }',
    '@inject() class Service { constructor(private logger: Logger) {} }',
    '@inject() class Service { constructor(private readonly logger: Logger, protected db: Database) {} }',
    '@inject() class Service { constructor(@named("logger") private logger: Logger) {} }',
    '@inject() class Service { constructor(private logger: Logger = defaultLogger) {} }',
    'class Service { #logger: Logger; constructor(logger: Logger) { this.#logger = logger; } }',
    'class Service { constructor(public logger: Logger) {} }',
    '@other() class Service { constructor(public logger: Logger) {} }',
    '@inject class Service { constructor(public logger: Logger) {} }',
    '@di.inject() class Service { constructor(public logger: Logger) {} }',
    '@inject() class Service {}',
    '@inject() class Service { constructor(logger: Logger) {} }',
    '@inject() class Service { logger: Logger; constructor(logger: Logger) { this.logger = logger; } }',
    '@inject() class Service { #logger; constructor(logger) { this.#logger = logger; } }',
    '@inject() class Service { #logger: Logger; constructor(logger: Logger) { this.#logger = wrap(logger); } }',
    '@inject() class Service { #logger: Logger; constructor({ logger }: Options) { this.#logger = logger; } }',
    '@inject() class Service { #logger: Logger; constructor(logger: Logger = defaultLogger) { this.#logger = logger; } }',
    '@inject() class Service { #logger: Logger; constructor(logger: Logger) { this.#logger ||= logger; } }',
    '@inject() class Service { #logger: Logger; constructor(logger: Logger) { other.#logger = logger; } }',
  ],
  invalid: [
    {
      name: 'public parameter property',
      code: '@inject() class Service { constructor(public logger: Logger) {} }',
      output: '@inject() class Service { constructor(protected logger: Logger) {} }',
      errors: [{ messageId: 'preferParameterProperty', line: 1, column: 38, endColumn: 59 }],
    },
    {
      name: 'readonly without accessibility and default value',
      code: '@inject() class Service { constructor(readonly logger: Logger = defaultLogger) {} }',
      output:
        '@inject() class Service { constructor(protected readonly logger: Logger = defaultLogger) {} }',
      errors,
    },
    {
      name: 'preserves parameter decorators and comments',
      code: '@inject() class Service { constructor(@named("public") public /* dependency */ readonly logger: Logger) {} }',
      output:
        '@inject() class Service { constructor(@named("public") protected /* dependency */ readonly logger: Logger) {} }',
      errors,
    },
    {
      name: 'readonly parameter with decorator',
      code: '@inject() class Service { constructor(@named("logger") readonly logger: Logger) {} }',
      output:
        '@inject() class Service { constructor(@named("logger") protected readonly logger: Logger) {} }',
      errors,
    },
    {
      name: 'removes field and assignment and renames all references',
      code: '@inject() class Service { #dependency: Logger; constructor(logger: Logger) { this.#dependency = logger; } run(other: Service) { this.#dependency.log(); return other.#dependency; } }',
      output:
        '@inject() class Service {  constructor(protected logger: Logger) {  } run(other: Service) { this.logger.log(); return other.logger; } }',
      errors,
    },
    {
      name: 'preserves readonly and definite assignment',
      code: '@inject() class Service { readonly #logger!: Logger; constructor(logger: Logger) { this.#logger = logger; } }',
      output: '@inject() class Service {  constructor(protected readonly logger: Logger) {  } }',
      errors,
    },
    {
      name: 'fixes multiple dependencies atomically even with reversed names',
      code: '@inject() class Service { #first: Logger; #second: Database; constructor(second: Logger, first: Database, public cache: Cache) { this.#first = second; this.#second = first; } run() { return [this.#first, this.#second, this.cache]; } }',
      output:
        '@inject() class Service {   constructor(protected second: Logger, protected first: Database, protected cache: Cache) {   } run() { return [this.second, this.first, this.cache]; } }',
      errors,
    },
    {
      name: 'handles decorated class expressions',
      code: 'const Service = @inject() class { #logger: Logger; constructor(logger: Logger) { this.#logger = logger; } }',
      output: 'const Service = @inject() class {  constructor(protected logger: Logger) {  } }',
      errors,
    },
    {
      name: 'keeps unrelated private fields and static initializers',
      code: '@inject() class Service { #logger: Logger; #other: Other; static count = 0; constructor(logger: Logger) { this.#logger = logger; } run() { return [this.#logger, this.#other]; } }',
      output:
        '@inject() class Service {  #other: Other; static count = 0; constructor(protected logger: Logger) {  } run() { return [this.logger, this.#other]; } }',
      errors,
    },
    ...[
      {
        name: 'different type annotations',
        code: '@inject() class Service { #logger: Other; constructor(logger: Logger) { this.#logger = logger; } }',
      },
      {
        name: 'missing field annotation',
        code: '@inject() class Service { #logger; constructor(logger: Logger) { this.#logger = logger; } }',
      },
      {
        name: 'field initializer',
        code: '@inject() class Service { #logger: Logger = defaultLogger; constructor(logger: Logger) { this.#logger = logger; } }',
      },
      {
        name: 'unrelated instance initializer observes initialization order',
        code: '@inject() class Service { #logger: Logger; ready = this.#logger; constructor(logger: Logger) { this.#logger = logger; } }',
      },
      {
        name: 'auto-accessor initializer observes initialization order',
        code: '@inject() class Service { #logger: Logger; accessor ready = this.#logger; constructor(logger: Logger) { this.#logger = logger; } }',
      },
      {
        name: 'static private field',
        code: '@inject() class Service { static #logger: Logger; constructor(logger: Logger) { this.#logger = logger; } }',
      },
      {
        name: 'optional field',
        code: '@inject() class Service { #logger?: Logger; constructor(logger: Logger) { this.#logger = logger; } }',
      },
      {
        name: 'decorated field',
        code: '@inject() class Service { @decorate() #logger: Logger; constructor(logger: Logger) { this.#logger = logger; } }',
      },
      {
        name: 'decorated plain parameter',
        code: '@inject() class Service { #logger: Logger; constructor(@named("logger") logger: Logger) { this.#logger = logger; } }',
      },
      {
        name: 'method name collision',
        code: '@inject() class Service { #dependency: Logger; logger() {} constructor(logger: Logger) { this.#dependency = logger; } }',
      },
      {
        name: 'string property name collision',
        code: '@inject() class Service { #dependency: Logger; "logger"() {} constructor(logger: Logger) { this.#dependency = logger; } }',
      },
      {
        name: 'computed member could collide',
        code: '@inject() class Service { #dependency: Logger; [key]() {} constructor(logger: Logger) { this.#dependency = logger; } }',
      },
      {
        name: 'comment before field',
        code: '@inject() class Service { /* dependency */ #logger: Logger; constructor(logger: Logger) { this.#logger = logger; } }',
      },
      {
        name: 'comment inside field',
        code: '@inject() class Service { #logger: /* dependency */ Logger; constructor(logger: Logger) { this.#logger = logger; } }',
      },
      {
        name: 'comment before assignment',
        code: '@inject() class Service { #logger: Logger; constructor(logger: Logger) { /* dependency */ this.#logger = logger; } }',
      },
      {
        name: 'comment inside assignment',
        code: '@inject() class Service { #logger: Logger; constructor(logger: Logger) { this.#logger = /* dependency */ logger; } }',
      },
      {
        name: 'trailing assignment comment',
        code: '@inject() class Service { #logger: Logger; constructor(logger: Logger) { this.#logger = logger; // dependency\n } }',
      },
      {
        name: 'constructor has other logic',
        code: '@inject() class Service { #logger: Logger; constructor(logger: Logger) { initialize(); this.#logger = logger; } }',
      },
      {
        name: 'ordinary property assignment may invoke a setter',
        code: '@inject() class Service { #logger: Logger; set ready(value: boolean) { observe(this.#logger); } constructor(logger: Logger, ready: boolean) { this.ready = ready; this.#logger = logger; } }',
      },
      {
        name: 'derived class calls super',
        code: '@inject() class Service extends Base { #logger: Logger; constructor(logger: Logger) { super(); this.#logger = logger; } }',
      },
      {
        name: 'private brand check',
        code: '@inject() class Service { #logger: Logger; constructor(logger: Logger) { this.#logger = logger; } has(other: object) { return #logger in other; } }',
      },
      {
        name: 'nested class references outer private field',
        code: '@inject() class Service { #logger: Logger; constructor(logger: Logger) { this.#logger = logger; } nested() { return class { read(service: Service) { return service.#logger; } }; } }',
      },
      {
        name: 'field assigned twice',
        code: '@inject() class Service { #logger: Logger; constructor(logger: Logger) { this.#logger = logger; this.#logger = fallback; } }',
      },
      {
        name: 'one parameter assigned to multiple fields',
        code: '@inject() class Service { #logger: Logger; #copy: Logger; constructor(logger: Logger) { this.#logger = logger; this.#copy = logger; } }',
      },
    ].map(test => ({ ...test, errors, output: null })),
    {
      name: 'fixable and unfixable reports coexist',
      code: '@inject() class Service { #logger: Other; constructor(logger: Logger, public db: Database) { this.#logger = logger; } }',
      output:
        '@inject() class Service { #logger: Other; constructor(logger: Logger, protected db: Database) { this.#logger = logger; } }',
      errors: [errors[0]!, errors[0]!],
    },
    {
      name: 'class scopes stay independent',
      code: '@inject() class A { #logger: Logger; constructor(logger: Logger) { this.#logger = logger; } } class B { #logger: Logger; constructor(logger: Logger) { this.#logger = logger; } } @inject() class C { constructor(public db: Database) {} }',
      output:
        '@inject() class A {  constructor(protected logger: Logger) {  } } class B { #logger: Logger; constructor(logger: Logger) { this.#logger = logger; } } @inject() class C { constructor(protected db: Database) {} }',
      errors: [errors[0]!, errors[0]!],
    },
    {
      name: 'nested decorated class uses its own scope',
      code: '@inject() class Outer { #logger: Logger; constructor(logger: Logger) { this.#logger = logger; } nested() { return @inject() class Inner { #logger: Logger; constructor(logger: Logger) { this.#logger = logger; } }; } }',
      output:
        '@inject() class Outer { #logger: Logger; constructor(logger: Logger) { this.#logger = logger; } nested() { return @inject() class Inner {  constructor(protected logger: Logger) {  } }; } }',
      errors: [errors[0]!, errors[0]!],
    },
  ],
})
